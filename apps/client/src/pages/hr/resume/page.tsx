import { t } from "@lingui/macro";
import { SidebarSimpleIcon } from "@phosphor-icons/react";
import type { ResumeDto } from "@reactive-resume/dto";
import { Button, Sheet, SheetClose, SheetContent, SheetTrigger } from "@reactive-resume/ui";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router";

import { HRResumeList } from "@/client/components/hr/resume-list";
import { axios } from "@/client/libs/axios";

import { Sidebar } from "../../dashboard/_components/sidebar";

const fetchResumesForUser = async (userId: string) => {
  const res = await axios.get<ResumeDto[]>(`/hr/resumes/${userId}`);
  return res.data;
};

export const HRResumePage = () => {
  const params = useParams() as { id?: string };
  const id = params.id ?? "";
  const [open, setOpen] = useState(false);

  const {
    data: resumes,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["hr-resumes", id],
    queryFn: () => fetchResumesForUser(id),
    enabled: id.length > 0,
  });

  return (
    <>
      <Helmet>
        <title>
          {t`HR Resume`} - {t`Reactive Resume`}
        </title>
      </Helmet>

      {/* Mobile sheet trigger */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 pb-0 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="bg-background">
              <SidebarSimpleIcon />
            </Button>
          </SheetTrigger>

          <SheetContent showClose={false} side="left" className="focus-visible:outline-none">
            <SheetClose asChild className="absolute left-4 top-4">
              <Button size="icon" variant="ghost">
                <SidebarSimpleIcon />
              </Button>
            </SheetClose>

            <Sidebar setOpen={setOpen} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop fixed sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-[320px] lg:flex-col"
      >
        <div className="h-full rounded p-4">
          <Sidebar />
        </div>
      </motion.div>

      <main className="mx-6 my-4 lg:mx-8 lg:pl-[320px]">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-2xl font-bold">{t`HR Resume`}</h1>

          <p className="text-sm opacity-70">
            {t`Viewing resumes for user`}: <strong>{id}</strong>
          </p>

          <HRResumeList resumes={resumes ?? []} isLoading={isFetching} error={error} />
        </div>
      </main>
    </>
  );
};

export default HRResumePage;
