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

          {/* User Profile Section */}
          {!isFetching && resumes && resumes.length > 0 && resumes[0].data.basics && (
            <div className="rounded-lg border-2 bg-secondary/10 p-6 shadow-sm">
              <div className="flex items-start gap-6">
                {/* Profile Picture */}
                {resumes[0].data.basics.picture.url &&
                  !resumes[0].data.basics.picture.effects.hidden && (
                    <div className="shrink-0">
                      <img
                        src={resumes[0].data.basics.picture.url}
                        alt={resumes[0].data.basics.name || t`Profile Picture`}
                        className="rounded-lg object-cover"
                        style={{
                          width: `${resumes[0].data.basics.picture.size || 64}px`,
                          height: `${resumes[0].data.basics.picture.size || 64}px`,
                          aspectRatio: resumes[0].data.basics.picture.aspectRatio || 1,
                          borderRadius: `${resumes[0].data.basics.picture.borderRadius || 0}%`,
                          filter: resumes[0].data.basics.picture.effects.grayscale
                            ? "grayscale(100%)"
                            : "none",
                          border: resumes[0].data.basics.picture.effects.border
                            ? "2px solid currentColor"
                            : "none",
                        }}
                      />
                    </div>
                  )}

                {/* Profile Information */}
                <div className="flex-1 space-y-3">
                  {/* Name */}
                  {resumes[0].data.basics.name && (
                    <h2 className="text-3xl font-bold">{resumes[0].data.basics.name}</h2>
                  )}

                  {/* Headline */}
                  {resumes[0].data.basics.headline && (
                    <p className="opacity-75">{resumes[0].data.basics.headline}</p>
                  )}

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 gap-2 pt-2 md:grid-cols-2">
                    {resumes[0].data.basics.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t`Email`}:</span>
                        <a
                          href={`mailto:${resumes[0].data.basics.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {resumes[0].data.basics.email}
                        </a>
                      </div>
                    )}

                    {resumes[0].data.basics.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t`Phone`}:</span>
                        <a
                          href={`tel:${resumes[0].data.basics.phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {resumes[0].data.basics.phone}
                        </a>
                      </div>
                    )}

                    {resumes[0].data.basics.location && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t`Location`}:</span>
                        <span className="text-sm">{resumes[0].data.basics.location}</span>
                      </div>
                    )}

                    {resumes[0].data.basics.url.href && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t`Website`}:</span>
                        <a
                          href={resumes[0].data.basics.url.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {resumes[0].data.basics.url.label || resumes[0].data.basics.url.href}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Custom Fields */}
                  {resumes[0].data.basics.customFields.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-sm font-medium">{t`Additional Information`}:</span>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {resumes[0].data.basics.customFields.map((field, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm font-medium">{field.name}:</span>
                            <span className="text-sm">{field.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies Section */}
                  {resumes[0].data.sections.skills.items.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <span className="text-sm font-medium">{t`Technologies`}:</span>
                      <div className="space-y-2">
                        {resumes[0].data.sections.skills.items.map((skill, index) => {
                          if (skill.keywords.length === 0) return null;
                          return (
                            <div key={index} className="flex flex-wrap gap-2">
                              {skill.name && (
                                <span className="text-sm font-medium">{skill.name}:</span>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {skill.keywords.map((keyword, kIndex) => (
                                  <span
                                    key={kIndex}
                                    className="rounded-full bg-primary/10 px-2 py-0.5 text-xs"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isFetching && <p className="text-sm opacity-70">{t`Loading user profile...`}</p>}

          <HRResumeList resumes={resumes ?? []} isLoading={isFetching} error={error} />
        </div>
      </main>
    </>
  );
};

export default HRResumePage;
