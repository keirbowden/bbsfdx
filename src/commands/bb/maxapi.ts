import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('bbsfdx', 'maxapi');

export default class Parallel extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx bb:maxapi --targetusername myOrg@example.com
Max API version for org: 48.0  
`
    ,
  `$ sfdx bb:maxapi --targetusername myOrg@example.com --json
  {
    "status": 0,
    "result": {
      "success": true,
      "maxApiVersion": "48.0"
    }
  }
  `
      ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  //protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    const conn = this.org.getConnection();
    const maxApiVersion = await conn.retrieveMaxApiVersion();

    this.ux.log(messages.getMessage('maxApiVersion') + maxApiVersion);
    
    return {success: true, maxApiVersion: maxApiVersion};
  }
}
