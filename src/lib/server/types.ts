import { Prettify } from "../utils";

export type ApiKeyUnstable = Prettify<ApiKey & { challengePool: string[] }>;

export type ApiKey = {
  siteKey: string;
  secretKey: string;
  label: string | null;
  allowedDomains: string[];
};

export type Application = {
  id: string;
  name?: string;
};

export type ChallengePreferences = {
  width: number;
  height: number;
  smallWidth: number;
  smallHeight: number;
  logoUrl: string | null;
};

export type Challenge = Prettify<
  { url: string; label: string | null } & ChallengePreferences
>;
