import * as tl from "azure-pipelines-task-lib/task";
import { PROP_NAMES } from "./constants";

type ScannerParams = { [key: string]: string | undefined };

export function waitFor(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function stringifyScannerParams(scannerParams: ScannerParams) {
  return JSON.stringify(
    scannerParams,
    Object.keys(scannerParams).filter((key) => scannerParams[key] != null),
  );
}

export function sanitizeScannerParams(scannerParams: ScannerParams) {
  delete scannerParams[PROP_NAMES.LOGIN];
  delete scannerParams[PROP_NAMES.PASSSWORD];
  delete scannerParams[PROP_NAMES.TOKEN];
  return scannerParams;
}

export function isWindows() {
  return tl.getPlatform() === tl.Platform.Windows;
}

export function validateScannerMode(mode: string): string {
  const allowedModes = ["MSBuild", "CLI", "Other"];
  if (!mode || !allowedModes.includes(mode)) {
    throw new Error(`Invalid scanner mode. Allowed values: ${allowedModes.join(", ")}`);
  }
  return mode;
}

export function validateAndParseJson(jsonString: string, fieldName: string): any {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (parsed === null || typeof parsed !== 'object') {
      throw new Error(`${fieldName} must be a valid JSON object`);
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid JSON in ${fieldName}`);
  }
}
