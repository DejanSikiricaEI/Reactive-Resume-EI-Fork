import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { createId } from "@paralleldrive/cuid2";
import { User } from "@prisma/client";
import { ErrorMessage, processUsername } from "@reactive-resume/utils";
import { Profile, Strategy, StrategyOptions, VerifyCallback } from "passport-microsoft";

import { UserService } from "@/server/user/user.service";

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, "microsoft") {
  constructor(
    readonly clientID: string,
    readonly clientSecret: string,
    readonly callbackURL: string,
    private readonly userService: UserService,
  ) {
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["user.read"],
      tenant: "common",
    } as StrategyOptions);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const { displayName, emails, _json } = profile;

      const email = (emails?.[0].value ?? _json?.userPrincipalName)?.toLocaleLowerCase();
      const picture = _json?.picture;

      if (!email) {
        Logger.error("Microsoft SSO: No email provided in profile");
        done(new BadRequestException(ErrorMessage.InvalidCredentials));
        return;
      }

      let user: User | null = null;

      try {
        user = await this.userService.findOneByIdentifier(email);

        if (!user) {
          Logger.log(`Microsoft SSO: Creating new user for email: ${email}`);
          throw new BadRequestException(ErrorMessage.InvalidCredentials);
        }

        Logger.log(`Microsoft SSO: User found, authenticating: ${email}`);
        done(null, user);
        return;
      } catch {
        try {
          user = await this.userService.create({
            email,
            picture,
            locale: "en-US",
            provider: "microsoft",
            name: displayName || createId(),
            emailVerified: true, // auto-verify emails
            username: processUsername(email.split("@")[0]),
            secrets: { create: {} },
          });

          Logger.log(`Microsoft SSO: User created successfully: ${email}`);
          done(null, user);
          return;
        } catch (error) {
          Logger.error(`Microsoft SSO: Failed to create user for ${email}`, error);
          done(new BadRequestException(ErrorMessage.UserAlreadyExists));
          return;
        }
      }
    } catch (error) {
      Logger.error("Microsoft SSO: Unexpected error during authentication", error);
      done(new BadRequestException(ErrorMessage.SomethingWentWrong));
    }
  }
}
