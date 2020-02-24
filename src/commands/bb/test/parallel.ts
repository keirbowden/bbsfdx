import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { getTmpDir } from '../../../shared/files';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { removeSync } from 'fs-extra';
import { createReadStream } from 'fs';
import compressing=require('compressing');
import { DeployResult } from 'jsforce';


// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('bbsfdx', 'test');

export default class Parallel extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx bb:test:parallel -d --targetusername myOrg@example.com
   Not done yet - sleeping
   Disable parallel test execution succeeded
  `,
  `$ sfdx bb:test:parallel -e --targetusername myOrg@example.com --json
  {
    "status": 0,
    "result": {
      "success": true,
      "message": "Disable parallel test execution succeeded"
    }
  }
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    disable: flags.boolean({char: 'd', description: messages.getMessage('disableFlagDescription')}),
    enable: flags.boolean({char: 'e', description: messages.getMessage('enableFlagDescription')}),
    keep: flags.boolean({char: 'k', description: messages.getMessage('keepFlagDescription')})
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  //protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    let attr='false';

    if (this.flags.disable) {
      attr='true';
    }

    const conn = this.org.getConnection();
    const apiVersion = await conn.retrieveMaxApiVersion();

    let tmpDir=getTmpDir();
    let targetDir=join(tmpDir, 'target');
    mkdirSync(targetDir);

    let settingsDir=join(targetDir, 'settings');
    mkdirSync(settingsDir);

    let packageFile=join(targetDir, 'package.xml');
    let packageContents='<?xml version="1.0" encoding="UTF-8"?>\n' + 
    '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
    ' <types>\n' + 
    '   <name>Settings</name>\n';

    let fltVersion=parseFloat(apiVersion);

    if (fltVersion>46) {
      packageContents+='    <members>Apex</members>\n' + 
                       '  </types>\n' +
                       '  <version>47.0</version>\n' + 
                       '</Package>';
      let apex=join(settingsDir, 'Apex.settings');
      writeFileSync(apex, 
            '<?xml version="1.0" encoding="UTF-8"?>\n' + 
            '<ApexSettings xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
            '  <enableDisableParallelApexTesting>' + attr + '</enableDisableParallelApexTesting>\n' +
            '</ApexSettings>\n'
              );
    }
    else {
      packageContents+='    <members>OrgPreference</members>\n' + 
                       '  </types>\n' +
                       '  <version>46.0</version>\n' + 
                       '</Package>';
      let orgPref=join(settingsDir, 'OrgPreference.settings');
      writeFileSync(orgPref, 
        '<?xml version="1.0" encoding="UTF-8"?>\n' + 
        '<OrgPreferenceSettings xmlns="http://soap.sforce.com/2006/04/metadata">\n' + 
        '  <preferences>\n' + 
        '     <settingName>DisableParallelApexTesting</settingName>\n' + 
        '     <settingValue>' + attr + '</settingValue>\n' + 
        '  </preferences>\n' + 
        '</OrgPreferenceSettings>\n'
      );
    }

    writeFileSync(packageFile, packageContents);
    
    const zipFile=join(tmpDir, 'pkg.zip');
    await compressing.zip.compressDir(targetDir, zipFile);

    let zipStream=createReadStream(zipFile);
    let result=await conn.metadata.deploy(zipStream, {});

    let done=false;

    let deployResult:DeployResult;
    
    while (!done) {
      deployResult=await conn.metadata.checkDeployStatus(result.id);
      done=deployResult.done;
      if (!done) {
        this.ux.log(deployResult.status + messages.getMessage('sleeping'));
        await new Promise(sleep => setTimeout(sleep, 5000));
      }
    }

    let message=(this.flags.disable?'Disable':'Enable') + messages.getMessage('deploySucceded');
    if (!deployResult.success) {
      message=messages.getMessage('deployFailed') + ' ' + messages.getMessage('filesLocation') + tmpDir;
    }
    else if (this.flags.keep) {
      this.ux.log(messages.getMessage('filesLocation') + tmpDir);
    }
    else {
      await removeSync(tmpDir);
    }

    this.ux.log(message);
    return {success: deployResult.success, message: message};
  }
}
