import * as tl from "azure-pipelines-task-lib/task";
import analyzeTask from "../../../../../commonv5/ts/analyze-task";
import { JdkVersionSource } from "../../../../../commonv5/ts/helpers/constants";

async function run() {
  try {
    const jdkVersionSource = tl.getInput("jdkversion", true) as JdkVersionSource;
    await analyzeTask(__dirname, jdkVersionSource, true);
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
