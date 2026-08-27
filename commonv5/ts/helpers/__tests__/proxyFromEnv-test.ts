import * as tl from "azure-pipelines-task-lib/task";
import { URL } from "url";
import { getProxyFromURI } from "../proxyFromEnv";

const ENV_VARS = [
  "HTTP_PROXY",
  "http_proxy",
  "HTTPS_PROXY",
  "https_proxy",
  "NO_PROXY",
  "no_proxy",
];

beforeEach(() => {
  jest.restoreAllMocks();
  ENV_VARS.forEach((v) => delete process.env[v]);
});

afterAll(() => {
  ENV_VARS.forEach((v) => delete process.env[v]);
});

describe("getProxyFromURI", () => {
  it("should return null when no proxy env vars are set", () => {
    expect(getProxyFromURI(new URL("http://example.com"))).toBeNull();
    expect(getProxyFromURI(new URL("https://example.com"))).toBeNull();
  });

  it("should return HTTP_PROXY for http: URLs", () => {
    process.env.HTTP_PROXY = "http://proxy:8080";
    expect(getProxyFromURI(new URL("http://example.com"))).toBe("http://proxy:8080");
  });

  it("should return http_proxy (lowercase) for http: URLs", () => {
    process.env.http_proxy = "http://proxy-lower:8080";
    expect(getProxyFromURI(new URL("http://example.com"))).toBe("http://proxy-lower:8080");
  });

  it("should return HTTPS_PROXY for https: URLs", () => {
    process.env.HTTPS_PROXY = "http://secure-proxy:8443";
    expect(getProxyFromURI(new URL("https://example.com"))).toBe("http://secure-proxy:8443");
  });

  it("should fall back to HTTP_PROXY for https: URLs when HTTPS_PROXY is not set", () => {
    process.env.HTTP_PROXY = "http://fallback-proxy:8080";
    expect(getProxyFromURI(new URL("https://example.com"))).toBe("http://fallback-proxy:8080");
  });

  it("should return null when NO_PROXY is wildcard", () => {
    process.env.HTTP_PROXY = "http://proxy:8080";
    process.env.NO_PROXY = "*";
    expect(getProxyFromURI(new URL("http://example.com"))).toBeNull();
  });

  it("should return null when URL matches NO_PROXY list", () => {
    process.env.HTTP_PROXY = "http://proxy:8080";
    process.env.NO_PROXY = "example.com,other.com";
    expect(getProxyFromURI(new URL("http://example.com"))).toBeNull();
  });

  it("should return proxy when URL does not match NO_PROXY list", () => {
    process.env.HTTP_PROXY = "http://proxy:8080";
    process.env.NO_PROXY = "other.com";
    expect(getProxyFromURI(new URL("http://example.com"))).toBe("http://proxy:8080");
  });

  it("should return null for unsupported protocols", () => {
    process.env.HTTP_PROXY = "http://proxy:8080";
    expect(getProxyFromURI(new URL("ftp://example.com"))).toBeNull();
  });
});

describe("maskProxyCredentials", () => {
  it("should mask password in proxy URL", () => {
    const setSecretSpy = jest.spyOn(tl, "setSecret").mockImplementation(() => undefined);
    process.env.HTTP_PROXY = "http://user:s3cret@proxy:8080";

    getProxyFromURI(new URL("http://example.com"));

    expect(setSecretSpy).toHaveBeenCalledWith("s3cret");
    expect(setSecretSpy).toHaveBeenCalledWith("user");
  });

  it("should mask only username when no password", () => {
    const setSecretSpy = jest.spyOn(tl, "setSecret").mockImplementation(() => undefined);
    process.env.HTTP_PROXY = "http://user@proxy:8080";

    getProxyFromURI(new URL("http://example.com"));

    expect(setSecretSpy).toHaveBeenCalledWith("user");
    expect(setSecretSpy).toHaveBeenCalledTimes(1);
  });

  it("should not call setSecret when proxy has no credentials", () => {
    const setSecretSpy = jest.spyOn(tl, "setSecret").mockImplementation(() => undefined);
    process.env.HTTP_PROXY = "http://proxy:8080";

    getProxyFromURI(new URL("http://example.com"));

    expect(setSecretSpy).not.toHaveBeenCalled();
  });

  it("should return the proxy URL unchanged", () => {
    jest.spyOn(tl, "setSecret").mockImplementation(() => undefined);
    process.env.HTTP_PROXY = "http://user:pass@proxy:8080";

    const result = getProxyFromURI(new URL("http://example.com"));

    expect(result).toBe("http://user:pass@proxy:8080");
  });

  it("should handle URL-encoded credentials", () => {
    const setSecretSpy = jest.spyOn(tl, "setSecret").mockImplementation(() => undefined);
    process.env.HTTP_PROXY = "http://user%40corp:p%40ss%3Aword@proxy:8080";

    getProxyFromURI(new URL("http://example.com"));

    expect(setSecretSpy).toHaveBeenCalledWith("p%40ss%3Aword");
    expect(setSecretSpy).toHaveBeenCalledWith("user%40corp");
  });
});
