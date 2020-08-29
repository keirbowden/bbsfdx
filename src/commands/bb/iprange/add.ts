import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { parse} from 'fast-xml-parser';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Builder } from 'xml2js';
import { getTmpDir } from '../../../shared/files';
import { deployMetadata, retrieveMetadata } from '../../../shared/metadata';
import { RetrieveResult } from '../../../shared/types';

import compressing = require('compressing');

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('bbsfdx', 'iprange');

export default class Add extends SfdxCommand {

  public static description = messages.getMessage('addCommandDescription');

  public static examples = [
  `$ sfdx bb:iprange:add --targetusername myOrg@example.com --range 192.168.1.1:192.168.1.255,192.168.1.4
   Not done yet - sleeping
   Add IP range succeeded
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    range: flags.array({
      char: 'r',
      description: messages.getMessage('rangeFlagDescription'),
      delimiter: ',',
      map: (val: string) => val.split(':')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  // protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    this.ux.log('Range = ' + JSON.stringify(this.flags.range, null, 4));
    const conn = this.org.getConnection();

    const retrieveMDTypes = [{
      members: 'Security',
      name: 'Settings'
    }];

    const retrieveResult: RetrieveResult = await retrieveMetadata(conn, retrieveMDTypes, this.ux, messages);

    const tmpDir = getTmpDir();
    const buff = Buffer.from(retrieveResult.zipFile, 'base64');
    await compressing.zip.uncompress(buff, tmpDir);
    const settings = readFileSync(join(tmpDir, 'settings', 'Security.settings'), 'utf-8');
    const md = parse(settings);

    let networkAccess = md.SecuritySettings.networkAccess;
    if (networkAccess === '') {
      networkAccess = {ipRanges: []};
      md.SecuritySettings.networkAccess = networkAccess;
    }

    if (!Array.isArray(networkAccess.ipRanges)) {
      networkAccess.ipRanges = [networkAccess.ipRanges];
    }

    for (const range of this.flags.range) {
      const start: string = range[0];
      let end: string;
      if (2 === range.length) {
        end = range[1];
      } else  {
        end = range[0];
      }
      networkAccess.ipRanges.push({start, end});
    }

    const targetDir = join(tmpDir, 'target');
    mkdirSync(targetDir);

    const settingsDir = join(targetDir, 'settings');
    mkdirSync(settingsDir);

    const packageFile = join(targetDir, 'package.xml');
    const packageContents = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
    ' <types>\n' +
    '   <name>Settings</name>\n' +
    '   <members>Security</members>\n' +
                       '  </types>\n' +
                       '  <version>49.0</version>\n' +
                       '</Package>';

    writeFileSync(packageFile, packageContents);

    const security = join(settingsDir, 'Security.settings');

    const builder = new Builder({renderOpts:
    {pretty: true,
    indent: '    ',
    newline: '\n'},
    stringify: {
       attValue(str) {
        return str.replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');
        }
    },
    xmldec: {
    version: '1.0', encoding: 'UTF-8'
    }
    });
    const xml = builder.buildObject(md);

    writeFileSync(security, xml);

    const zipFile = join(tmpDir, 'uploadpkg.zip');
    await compressing.zip.compressDir(targetDir, zipFile);

    const deployResult = await deployMetadata(conn, zipFile, this.ux, messages);

    this.ux.log(messages.getMessage('result').replace('{0}', deployResult.status));

    return {success: deployResult.success};
  }
}
