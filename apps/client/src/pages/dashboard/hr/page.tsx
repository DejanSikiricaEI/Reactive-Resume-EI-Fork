import { t } from "@lingui/macro";
import { ScrollArea, Separator } from "@reactive-resume/ui";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router";

import { useUser } from "@/client/services/user";

import { HRSearch } from "./_components/search";

export const HRPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirect non-HR and non-ADMIN users away from this page
  useEffect(() => {
    if (!user) return; // let auth flow handle unauthenticated state
    if (user.role !== "HR" && user.role !== "ADMIN") {
      void navigate("/dashboard");
    }
  }, [user, navigate]);
  return (
    <>
      <Helmet>
        <title>
          {t`HR`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      <div className="max-w-2xl space-y-4">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold tracking-tight"
        >
          {t`HR`}
        </motion.h1>

        <ScrollArea hideScrollbar className="h-[calc(100vh-140px)] lg:h-[calc(100vh-88px)]">
          <div className="space-y-6">
            <HRSearch />
          </div>
          <Separator />
        </ScrollArea>
      </div>
    </>
  );
};

export default HRPage;
