import { UrlWithStringQuery } from "url";
import * as tl from "azure-pipelines-task-lib/task";

function formatHostname(hostname: string) {
  // canonicalize the hostname, so that 'oogle.com' won't match 'google.com'
  return hostname.replace(/^\.*/, ".").toLowerCase();
}

function parseNoProxyZone(zone: string) {
  zone = zone.trim().toLowerCase();

  const zoneParts = zone.split(":", 2);
  const zoneHost = formatHostname(zoneParts[0]);
  const zonePort = zoneParts[1];
  const hasPort = zone.indexOf(":") > -1;

  return { hostname: zoneHost, port: zonePort, hasPort };
}

function uriInNoProxy(url: UrlWithStringQuery, noProxy: string) {
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  const hostname = formatHostname(url.hostname);
  const noProxyList = noProxy.split(",");

  // iterate through the noProxyList until it finds a match.
  return noProxyList.map(parseNoProxyZone).some((noProxyZone) => {
    const isMatchedAt = hostname.indexOf(noProxyZone.hostname);
    const hostnameMatched =
      isMatchedAt > -1 && isMatchedAt === hostname.length - noProxyZone.hostname.length;

    if (noProxyZone.hasPort) {
      return port === noProxyZone.port && hostnameMatched;
    }

    return hostnameMatched;
  });
}

/**
 * Mask any embedded credentials in a proxy URL so they cannot leak into logs.
 * Registers the password (and username) with Azure DevOps secret masking.
 */
function maskProxyCredentials(proxyUrl: string): string {
  try {
    const parsed = new URL(proxyUrl);
    if (parsed.password) {
      tl.setSecret(parsed.password);
    }
    if (parsed.username) {
      tl.setSecret(parsed.username);
    }
  } catch (err) {
    tl.debug(
      `[SQ] maskProxyCredentials: unable to parse proxy URL, skipping mask (${(err as Error)?.message ?? "unknown error"})`,
    );
  }
  return proxyUrl;
}

export function getProxyFromURI(url: UrlWithStringQuery) {
  // Decide the proper request proxy to use based on the request URI object and the
  // environmental constiables (NO_PROXY, HTTP_PROXY, etc.)
  // respect NO_PROXY environment constiables (see: https://lynx.invisible-island.net/lynx2.8.7/breakout/lynx_help/keystrokes/environments.html)

  const noProxy = process.env.NO_PROXY || process.env.no_proxy || "";

  // if the noProxy is a wildcard then return null

  if (noProxy === "*") {
    return null;
  }

  // if the noProxy is not empty and the uri is found return null

  if (noProxy !== "" && uriInNoProxy(url, noProxy)) {
    return null;
  }

  // Check for HTTP or HTTPS Proxy in environment Else default to null

  let proxyUrl: string | null = null;

  if (url.protocol === "http:") {
    proxyUrl = process.env.HTTP_PROXY || process.env.http_proxy || null;
  } else if (url.protocol === "https:") {
    proxyUrl =
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy ||
      null;
  }

  // Mask any embedded credentials before returning.
  if (proxyUrl) {
    return maskProxyCredentials(proxyUrl);
  }

  return null;
}
