import * as tl from "azure-pipelines-task-lib/task";
import fetch from "node-fetch";
import * as semver from "semver";
import { URL } from "url";
import Endpoint from "../sonarqube/Endpoint";

export interface RequestData {
  [x: string]: any;
}

export async function get<T>(
  endpoint: Endpoint,
  path: string,
  isJson: boolean,
  query?: RequestData,
): Promise<T | string> {
  const fullUrl = new URL(path, endpoint.url);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null) {
        fullUrl.searchParams.append(key, String(value));
      }
    }
  }

  if (fullUrl.origin !== new URL(endpoint.url).origin) {
    throw new Error(
      `URL origin mismatch: request targets ${fullUrl.origin} but endpoint is configured for ${new URL(endpoint.url).origin}`,
    );
  }

  if (fullUrl.protocol === "http:") {
    tl.warning("Insecure HTTP connection detected. Consider using HTTPS for secure communication.");
  }

  const fullUrlString = fullUrl.toString();
  tl.debug(`[SQ] API GET: '${path}'`);

  try {
    const response = await fetch(fullUrlString, endpoint.toFetchOptions(fullUrlString));
    if (isJson) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    tl.debug(`[SQ] API GET '${path}' failed`);
    throw new Error(`[SQ] API GET '${path}' failed`);
  }
}

export async function getServerVersion(endpoint: Endpoint): Promise<semver.SemVer> {
  const serverVersion = await get<string>(endpoint, "/api/server/version", false);
  tl.debug(`[SQ] Server version: ${serverVersion}`);
  return semver.coerce(serverVersion);
}
