declare module "passport-microsoft" {
  import { Strategy as PassportStrategy } from "passport";

  export type Profile = {
    provider: string;
    id: string;
    displayName: string;
    name?: {
      familyName?: string;
      givenName?: string;
    };
    emails?: { value: string; type?: string }[];
    photos?: { value: string }[];
    _raw?: string;
    _json?: {
      userPrincipalName?: string;
      picture?: string;
      [key: string]: unknown;
    };
  };

  export type StrategyOptions = {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string | string[];
    tenant?: string;
  };

  export type VerifyCallback = (error?: Error | null, user?: Express.User, info?: unknown) => void;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
  }
}
