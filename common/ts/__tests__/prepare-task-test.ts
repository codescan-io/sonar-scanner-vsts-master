import * as tl from "azure-pipelines-task-lib/task";
import { SemVer } from "semver";
import * as request from "../helpers/request";
import * as prept from "../prepare-task";
import Endpoint, { EndpointType } from "../sonarqube/Endpoint";
import Scanner, { ScannerMSBuild } from "../sonarqube/Scanner";

beforeEach(() => {
  jest.restoreAllMocks();
});

const SQ_ENDPOINT = new Endpoint(EndpointType.SonarQube, { url: "https://sonarqube.com" });

it("should display warning for dedicated extension for Sonarcloud", async () => {
  const scannerObject = new ScannerMSBuild(__dirname, {
    projectKey: "dummyProjectKey",
    projectName: "dummyProjectName",
    projectVersion: "dummyProjectVersion",
    organization: "dummyOrganization",
  });

  jest.spyOn(tl, "getVariable").mockImplementation(() => "");
  jest.spyOn(tl, "warning").mockImplementation(() => null);
  jest.spyOn(Scanner, "getPrepareScanner").mockImplementation(() => scannerObject);
  jest.spyOn(scannerObject, "runPrepare").mockImplementation(() => null);
  jest.spyOn(request, "getServerVersion").mockResolvedValue(new SemVer("7.2.0"));

  jest.spyOn(prept, "getDefaultBranch").mockResolvedValue("refs/heads/master");

  await prept.default(SQ_ENDPOINT, __dirname);

  expect(tl.warning).toHaveBeenCalledWith(
    "This task is deprecated. Please upgrade to the latest version. For more information, refer to https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarqube-extension-for-azure-devops/",
  );
});

// Note: "should build report task path from variables" test was removed
// because the reportPath() function no longer exists in prepare-task.ts (pre-existing issue).
