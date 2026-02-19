import { z } from "zod";

export const URLProtocolSchema = z.enum(["http", "https"]);
export type URLProtocol = z.infer<typeof URLProtocolSchema>;

export const URLWithoutProtocolSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine((value) => !/^https?:\/\//i.test(value), "Do not include http:// or https://");

export const stripURLProtocol = (value: string) => value.replace(/^\s*https?:\/\//i, "").trim();

export const normalizeURLHost = (value: string) => stripURLProtocol(value).replace(/\/+$/, "");

export const buildURL = (protocol: URLProtocol, host: string) =>
  `${protocol}://${normalizeURLHost(host)}`;

export const getDefaultPowersyncHost = (serverHost: string) => {
  const normalized = normalizeURLHost(serverHost);
  return normalized ? `${normalized}/powersync` : "powersync";
};
