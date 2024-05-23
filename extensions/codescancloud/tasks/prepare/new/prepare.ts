import * as tl from 'vsts-task-lib/task';
import Endpoint, { EndpointType } from '../../../../../common/ts/sonarqube/Endpoint';
import prepareTask from '../../../../../common/ts/prepare-task';

async function run() {
  try {
    const endpoint = Endpoint.getEndpoint(
      tl.getInput(EndpointType.CodeScanCloud, true),
      EndpointType.CodeScanCloud
    );
    await prepareTask(endpoint, __dirname);
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
