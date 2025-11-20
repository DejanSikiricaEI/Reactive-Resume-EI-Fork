import { t } from "@lingui/macro";
import { SidebarSimpleIcon } from "@phosphor-icons/react";
import type { ResumeDto } from "@reactive-resume/dto";
import { Button, Sheet, SheetClose, SheetContent, SheetTrigger } from "@reactive-resume/ui";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router";

import { HRResumeList } from "@/client/components/hr/resume-list";
import { axios } from "@/client/libs/axios";

import { Sidebar } from "../../dashboard/_components/sidebar";

const fetchResumesForUser = async (userId: string) => {
  const res = await axios.get<ResumeDto[]>(`/hr/resumes/${userId}`);
  return res.data;
};

// Section configuration for dynamic rendering
const SECTION_CONFIG = {
  certifications: { labelKey: "Certifications", nameField: "name" },
  publications: { labelKey: "Publications", nameField: "name" },
  references: { labelKey: "References", nameField: "name" },
  languages: { labelKey: "Languages", nameField: "name" },
  awards: { labelKey: "Awards", nameField: "title" },
  education: { labelKey: "Education", nameField: "institution" },
  experience: { labelKey: "Experience", nameField: "company" },
  volunteer: { labelKey: "Volunteer", nameField: "organization" },
  projects: { labelKey: "Projects", nameField: "name" },
  profiles: { labelKey: "Profiles", nameField: "network" },
} as const;

export const HRResumePage = () => {
  const params = useParams() as { id?: string };
  const id = params.id ?? "";
  const [open, setOpen] = useState(false);
  const [selectedTechnologies, setSelectedTechnologies] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const {
    data: resumes,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["hr-resumes", id],
    queryFn: () => fetchResumesForUser(id),
    enabled: id.length > 0,
  });

  // Initialize all technologies and items as selected when data loads
  useEffect(() => {
    if (resumes && resumes.length > 0) {
      const allKeywords = new Set<string>();
      const allItems = new Set<string>();

      // Technologies from skills
      if (resumes[0].data.sections.skills.items.length > 0) {
        for (const [skillIndex, skill] of resumes[0].data.sections.skills.items.entries()) {
          for (const [keywordIndex] of skill.keywords.entries()) {
            allKeywords.add(`skill-${skillIndex}-${keywordIndex}`);
          }
        }
      }

      // Interests keywords
      if (resumes[0].data.sections.interests.items.length > 0) {
        for (const [interestIndex, interest] of resumes[0].data.sections.interests.items.entries()) {
          for (const [keywordIndex] of interest.keywords.entries()) {
            allKeywords.add(`interest-${interestIndex}-${keywordIndex}`);
          }
        }
      }

      // Loop through all other sections dynamically (except skills and interests which are handled above)
      const sectionsToProcess = [
        "certifications",
        "publications",
        "references",
        "languages",
        "awards",
        "education",
        "experience",
        "volunteer",
        "projects",
        "profiles",
      ] as const;

      for (const sectionKey of sectionsToProcess) {
        const section = resumes[0].data.sections[sectionKey];
        if (section && section.items && section.items.length > 0) {
          for (const [index] of section.items.entries()) {
            allItems.add(`${sectionKey.slice(0, -1)}-${index}`);
          }
        }
      }

      setSelectedTechnologies(allKeywords);
      setSelectedItems(allItems);
    }
  }, [resumes]);

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tech)) {
        newSet.delete(tech);
      } else {
        newSet.add(tech);
      }
      return newSet;
    });
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSkillGroup = (skillIndex: number, keywordCount: number) => {
    setSelectedTechnologies((prev) => {
      const newSet = new Set(prev);
      const keywordIds = Array.from({ length: keywordCount }, (_, i) => `skill-${skillIndex}-${i}`);
      const allSelected = keywordIds.every((id) => newSet.has(id));

      if (allSelected) {
        for (const id of keywordIds) {
          newSet.delete(id);
        }
      } else {
        for (const id of keywordIds) {
          newSet.add(id);
        }
      }
      return newSet;
    });
  };

  const toggleInterestGroup = (interestIndex: number, keywordCount: number) => {
    setSelectedTechnologies((prev) => {
      const newSet = new Set(prev);
      const keywordIds = Array.from({ length: keywordCount }, (_, i) => `interest-${interestIndex}-${i}`);
      const allSelected = keywordIds.every((id) => newSet.has(id));

      if (allSelected) {
        for (const id of keywordIds) {
          newSet.delete(id);
        }
      } else {
        for (const id of keywordIds) {
          newSet.add(id);
        }
      }
      return newSet;
    });
  };

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
          {!isFetching && resumes && resumes.length > 0 && (
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
                                <button
                                  type="button"
                                  className="cursor-pointer text-sm font-medium hover:text-primary"
                                  onClick={() => {
                                    toggleSkillGroup(index, skill.keywords.length);
                                  }}
                                >
                                  {skill.name}:
                                </button>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {skill.keywords.map((keyword, kIndex) => {
                                  const uniqueId = `skill-${index}-${kIndex}`;
                                  return (
                                    <button
                                      key={kIndex}
                                      type="button"
                                      className={`cursor-pointer rounded-full px-2 py-0.5 text-xs transition-colors ${
                                        selectedTechnologies.has(uniqueId)
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-primary/10 hover:bg-primary/20"
                                      }`}
                                      onClick={() => {
                                        toggleTechnology(uniqueId);
                                      }}
                                    >
                                      {keyword}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Interests Section */}
                  {resumes[0].data.sections.interests.items.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <span className="text-sm font-medium">{t`Interests`}:</span>
                      <div className="space-y-2">
                        {resumes[0].data.sections.interests.items.map((interest, index) => {
                          if (interest.keywords.length === 0) return null;
                          return (
                            <div key={index} className="flex flex-wrap gap-2">
                              {interest.name && (
                                <button
                                  type="button"
                                  className="cursor-pointer text-sm font-medium hover:text-primary"
                                  onClick={() => {
                                    toggleInterestGroup(index, interest.keywords.length);
                                  }}
                                >
                                  {interest.name}:
                                </button>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {interest.keywords.map((keyword, kIndex) => {
                                  const uniqueId = `interest-${index}-${kIndex}`;
                                  return (
                                    <button
                                      key={kIndex}
                                      type="button"
                                      className={`cursor-pointer rounded-full px-2 py-0.5 text-xs transition-colors ${
                                        selectedTechnologies.has(uniqueId)
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-primary/10 hover:bg-primary/20"
                                      }`}
                                      onClick={() => {
                                        toggleTechnology(uniqueId);
                                      }}
                                    >
                                      {keyword}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Languages Section */}
                  {resumes[0].data.sections.languages.items.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <span className="text-sm font-medium">{t`Languages`}:</span>
                      <div className="flex flex-wrap gap-1">
                        {resumes[0].data.sections.languages.items.map((language, index) => {
                          const uniqueId = `language-${index}`;
                          return (
                            <button
                              key={index}
                              type="button"
                              className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-colors ${
                                selectedItems.has(uniqueId)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-primary/10 hover:bg-primary/20"
                              }`}
                              onClick={() => {
                                toggleItem(uniqueId);
                              }}
                            >
                              {language.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Sections */}
                  {Object.entries(SECTION_CONFIG).map(([sectionKey, config]) => {
                    const section = resumes[0].data.sections[sectionKey as keyof typeof SECTION_CONFIG];
                    if (!section || !section.items || section.items.length === 0) return null;

                    const singularKey = sectionKey.slice(0, -1);
                    
                    return (
                      <div key={sectionKey} className="space-y-2 border-t pt-3">
                        <span className="text-sm font-medium">{t`${config.labelKey}`}:</span>
                        <div className="flex flex-wrap gap-1">
                          {section.items.map((item: any, index: number) => {
                            const uniqueId = `${singularKey}-${index}`;
                            const displayName = item[config.nameField] || "";
                            
                            return (
                              <button
                                key={index}
                                type="button"
                                className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-colors ${
                                  selectedItems.has(uniqueId)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-primary/10 hover:bg-primary/20"
                                }`}
                                onClick={() => {
                                  toggleItem(uniqueId);
                                }}
                              >
                                {displayName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
