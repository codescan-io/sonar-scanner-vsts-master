import * as tl from "azure-pipelines-task-lib/task";

export const PROP_NAMES = {
  HOST_URL: "sonar.host.url",
  LOGIN: "sonar.login",
  PASSSWORD: "sonar.password",
  TOKEN: "sonar.token",
  ORG: "sonar.organization",
  PROJECTKEY: "sonar.projectKey",
  PROJECTNAME: "sonar.projectName",
  PROJECTVERSION: "sonar.projectVersion",
  PROJECTSOURCES: "sonar.sources",
  PROJECTSETTINGS: "project.settings",
};

export function toCleanJSON(props: { [key: string]: string | undefined }) {
  return JSON.stringify(
    props,
    Object.keys(props).filter((key) => props[key] != null),
  );
}

export function setIfNotEmpty(props: { [key: string]: string }, key: string, value?: string) {
  if (value) {
    props[key] = value;
  }
}

export function sanitizeVariable(jsonPayload: string) {
  const jsonObj = JSON.parse(jsonPayload);
  delete jsonObj[PROP_NAMES.LOGIN];
  delete jsonObj[PROP_NAMES.PASSSWORD];
  jsonPayload = toCleanJSON(jsonObj);
  return jsonPayload;
}

const RESERVED_PROPERTY_KEYS = new Set([
  PROP_NAMES.HOST_URL,
  PROP_NAMES.LOGIN,
  PROP_NAMES.PASSSWORD,
  PROP_NAMES.TOKEN,
  PROP_NAMES.ORG,
]);

export function parseScannerExtraProperties(): { [key: string]: string } {
  const props: { [key: string]: string } = {};
  tl.getDelimitedInput("extraProperties", "\n")
    .filter((keyValue) => !keyValue.startsWith("#"))
    .map((keyValue) => keyValue.split(/=(.+)/))
    .forEach(([k, v]) => {
      if (k && RESERVED_PROPERTY_KEYS.has(k.trim())) {
        tl.warning(
          `Extra property '${k.trim()}' is reserved and cannot be overridden. Ignoring.`,
        );
        return;
      }
      if (k) {
        props[k] = v;
      }
    });
  return props;
}

export function isWindows() {
  return tl.getPlatform() === tl.Platform.Windows;
}
