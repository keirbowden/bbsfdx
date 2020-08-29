import { createReadStream } from 'fs';
import { promisify } from 'util';
import { DeployResult, RetrieveResult } from './types';

export async function deployMetadata(conn, zipFile, ux, messages): Promise<DeployResult> {
    ux.log('Deploying');

    const zipStream = createReadStream(zipFile);
    const result = await conn.metadata.deploy(zipStream, {});

    let done = false;

    let deployResult: DeployResult;

    while (!done) {
      deployResult = await conn.metadata.checkDeployStatus(result.id);
      done = deployResult.done;
      if (!done) {
        ux.log(deployResult.status + messages.getMessage('sleeping'));
        await new Promise(sleep => setTimeout(sleep, 5000));
      }
    }

    return deployResult;
}

export async function retrieveMetadata(conn, types, ux, messages): Promise<RetrieveResult> {
    const asyncRetrieve = promisify(conn.metadata.retrieve);
    const retrieveCheck = await asyncRetrieve.call(conn.metadata, {
      apiVersion: '49.0',
      singlePackage: true,
      unpackaged: {
        types
      }
    });

    let retrieveResult: RetrieveResult;

    let done = false;
    while (!done) {
      retrieveResult = await conn.metadata.checkRetrieveStatus(retrieveCheck.id);
      done = JSON.parse(retrieveResult.done.toString());
      if (!done) {
        ux.log(retrieveResult.status + messages.getMessage('sleeping'));
        await new Promise(sleep => setTimeout(sleep, 5000));
      }
    }

    return retrieveResult;
}
