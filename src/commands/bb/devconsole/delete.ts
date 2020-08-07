import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('bbsfdx', 'devconsoledelete');

export default class Delete extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx bb:devconsole:delete --targetusername myOrg@example.com
  
  Deleting workspace records for user id XXXXXXXXXXXXXXXXX
  Successfully deleted 1 workspace records
`
      ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  // protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    const conn = this.org.getConnection();

    interface User {
      Id: string;
    }

    const users = await conn.query<User>('select Id from User where Username=\'' + conn.getUsername() + '\'');

    const userId = users.records[0].Id;
    this.ux.log(messages.getMessage('userIdLogMessage') + ' ' + userId);
    interface IDEWorkspace {
      Id: string;
    }

    const workspaces = await conn.tooling.query<IDEWorkspace>('select id from IDEWorkspace where CreatedById=\'' + userId + '\'');

    const workspaceIds = workspaces.records.map(workspace => {
      return workspace.Id;
    });

    const deleteResults = await conn.tooling.sobject('IDEWorkspace').delete( workspaceIds);

    let success = true;
    let deletedCount = 0;

    deleteResults.forEach(deleteResult => {
      success = success && deleteResult.success;
      deletedCount++;
    });

    if (success) {
      this.ux.log(messages.getMessage('successMessage').replace('{0}', deletedCount.toString()));
    }
    else {
      this.ux.log(messages.getMessage('errorMessage').replace('{0}', deletedCount.toString())
                                              .replace('{1}', workspaceIds.length.toString()));
    }

    return {success, deletedCount, totalRecords : workspaceIds.length};
  }
}
