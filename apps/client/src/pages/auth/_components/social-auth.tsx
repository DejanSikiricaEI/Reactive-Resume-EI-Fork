import { t } from "@lingui/macro";
import {
  FingerprintIcon,
  GithubLogoIcon,
  GoogleLogoIcon,
  InfoIcon,
  MicrosoftOutlookLogoIcon,
} from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle, Button } from "@reactive-resume/ui";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { useToast } from "@/client/hooks/use-toast";
import { useAuthProviders } from "@/client/services/auth/providers";

export const SocialAuth = () => {
  const { toast } = useToast();
  const { providers } = useAuthProviders();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      switch (error) {
        case "OAuthAccountNotLinked":
          toast({
            variant: "error",
            title: t`This account is already linked to another provider`,
          });
          break;
        case "OAuthCallback":
          toast({
            variant: "error",
            title: t`Authentication failed. Please try again`,
          });
          break;
        case "AccessDenied":
          toast({
            variant: "error",
            title: t`Access was denied. Please try again`,
          });
          break;
        default:
          toast({
            variant: "error",
            title: t`Authentication failed. Please try again`,
          });
      }
    }
  }, [searchParams, toast]);

  if (!providers || providers.length === 0) return null;

  // Filter out email to check if there are any SSO providers
  const ssoProviders = providers.filter((provider) => provider !== "email");

  // If no SSO providers are available, show informational message
  if (ssoProviders.length === 0) {
    return (
      <Alert>
        <InfoIcon className="size-4" />
        <AlertTitle>{t`Single Sign-On (SSO) Not Configured`}</AlertTitle>
        <AlertDescription>
          {t`SSO authentication is currently not available. Please sign in using your email and password.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {providers.includes("github") && (
        <Button asChild size="lg" className="w-full !bg-[#222] !text-white hover:!bg-[#222]/80">
          <a href="/api/auth/github">
            <GithubLogoIcon className="mr-3 size-4" />
            {t`GitHub`}
          </a>
        </Button>
      )}

      {providers.includes("google") && (
        <Button
          asChild
          size="lg"
          className="w-full !bg-[#4285F4] !text-white hover:!bg-[#4285F4]/80"
        >
          <a href="/api/auth/google">
            <GoogleLogoIcon className="mr-3 size-4" />
            {t`Google`}
          </a>
        </Button>
      )}

      {providers.includes("microsoft") && (
        <Button
          asChild
          size="lg"
          className="w-full !bg-[#00A4EF] !text-white hover:!bg-[#00A4EF]/80"
        >
          <a href="/api/auth/microsoft">
            <MicrosoftOutlookLogoIcon className="mr-3 size-4" />
            {t`Microsoft`}
          </a>
        </Button>
      )}

      {providers.includes("openid") && (
        <Button
          asChild
          size="lg"
          className="w-full !bg-[#dc2626] !text-white hover:!bg-[#dc2626]/80"
        >
          <a href="/api/auth/openid">
            <FingerprintIcon className="mr-3 size-4" />
            {import.meta.env.VITE_OPENID_NAME}
          </a>
        </Button>
      )}
    </div>
  );
};
