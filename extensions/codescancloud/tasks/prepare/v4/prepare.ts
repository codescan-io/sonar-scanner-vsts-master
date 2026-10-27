import * as tl from "azure-pipelines-task-lib/task";
import prepareTask from "../../../../../commonv5/ts/prepare-task";
import Endpoint, { EndpointType } from "../../../../../commonv5/ts/sonarqube/Endpoint";

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
