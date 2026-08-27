import * as tl from "azure-pipelines-task-lib/task";
import {
  JdkVersionSource,
  TASK_MISSING_VARIABLE_ERROR_HINT,
  TaskVariables,
} from "./helpers/constants";
import JavaVersionResolver from "./helpers/java-version-resolver";
import { sanitizeScannerParams, stringifyScannerParams, validateScannerMode, validateAndParseJson } from "./helpers/utils";
import { EndpointType } from "./sonarqube/Endpoint";
import Scanner, { ScannerMode } from "./sonarqube/Scanner";

export default async function analyzeTask(
  rootPath: string,
  jdkVersionSource: JdkVersionSource,
  isSonarCloud: boolean = true,
) {
  if (typeof tl.getVariable(TaskVariables.SonarQubeScannerMode) === "undefined") {
    tl.setResult(
      tl.TaskResult.Failed,
      `Variables are missing. Please make sure that you are running the Prepare task before running the Analyze task.\n${TASK_MISSING_VARIABLE_ERROR_HINT}`,
    );
    return;
  }

  Scanner.setIsSonarCloud(isSonarCloud);
  const serverVersion = tl.getVariable(TaskVariables.SonarQubeServerVersion);
  JavaVersionResolver.setJavaVersion(
    jdkVersionSource,
    EndpointType.CodeScanCloud,
    serverVersion,
  );

  // Run scanner - validate scanner mode
  const scannerModeValue = tl.getVariable(TaskVariables.SonarQubeScannerMode);
  const validatedMode = validateScannerMode(scannerModeValue);
  const scannerMode: ScannerMode = ScannerMode[validatedMode];
  const scanner = Scanner.getAnalyzeScanner(rootPath, scannerMode);

  let sqScannerParams;
  try {
    const paramsString = tl.getVariable(TaskVariables.SonarQubeScannerParams);
    if (!paramsString) {
      throw new Error("SonarQube scanner parameters are missing");
    }
    // Validate and parse JSON safely
    sqScannerParams = validateAndParseJson(paramsString, "scanner parameters");
  } catch (error) {
    tl.setResult(tl.TaskResult.Failed, "Failed to parse scanner parameters. Verify the Prepare task completed successfully.");
    return;
  }

  await scanner.runAnalysis();

  // Scrub credentials from SONARQUBE_SCANNER_PARAMS only AFTER the scanner
  // has run — the spawned sonar-scanner inherits this env var and needs
  // sonar.token / sonar.login present to authenticate.
  const sanitizedParams = sanitizeScannerParams(sqScannerParams);
  tl.setVariable(
    TaskVariables.SonarQubeScannerParams,
    stringifyScannerParams(sanitizedParams),
  );

  JavaVersionResolver.revertJavaHomeToOriginal();
}
