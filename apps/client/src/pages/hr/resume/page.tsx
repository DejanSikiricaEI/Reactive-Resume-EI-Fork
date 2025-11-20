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

      // Loop through all sections dynamically (except skills, interests, and projects)
      const sections = resumes[0].data.sections;
      for (const [sectionKey, section] of Object.entries(sections)) {
        if (sectionKey === "skills" || sectionKey === "interests" || sectionKey === "projects") continue;
        
        if (section && typeof section === "object" && "items" in section && Array.isArray(section.items)) {
          for (const [index] of section.items.entries()) {
            allItems.add(`${sectionKey}-${index}`);
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

                  {/* Dynamic Sections - Display all sections except skills, interests, and projects */}
                  {Object.entries(resumes[0].data.sections).map(([sectionKey, section]) => {
                    if (sectionKey === "skills" || sectionKey === "interests" || sectionKey === "projects") return null;
                    if (!section || typeof section !== "object") return null;

                    // Filter out properties we don't want to display
                    const filteredSection = Object.fromEntries(
                      Object.entries(section).filter(
                        ([key]) => !["visible", "columns", "separateLinks", "id"].includes(key)
                      )
                    );

                    // Check if there are items to display
                    const hasItems = "items" in filteredSection && Array.isArray(filteredSection.items) && filteredSection.items.length > 0;
                    
                    // Check if there are other properties to display
                    const otherProps = Object.entries(filteredSection).filter(([key]) => key !== "items");
                    
                    if (!hasItems && otherProps.length === 0) return null;

                    return (
                      <div key={sectionKey} className="space-y-2 border-t pt-3">
                        <span className="text-sm font-medium capitalize">{sectionKey}:</span>
                        
                        {/* Display non-items properties */}
                        {otherProps.length > 0 && (
                          <div className="space-y-1 text-sm">
                            {otherProps.map(([key, value]) => {
                              if (value === null || value === undefined || value === "") return null;
                              return (
                                <div key={key} className="flex gap-2">
                                  <span className="font-medium capitalize">{key}:</span>
                                  <span className="opacity-75">{String(value)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Display items if they exist */}
                        {hasItems && (
                          <div className="space-y-2">
                            {filteredSection.items.map((item: any, index: number) => {
                              const uniqueId = `${sectionKey}-${index}`;
                              
                              // Get all properties from the item except visible, columns, separateLinks, id
                              const itemProps = Object.entries(item).filter(
                                ([key]) => !["visible", "columns", "separateLinks", "id"].includes(key)
                              );

                              return (
                                <div
                                  key={index}
                                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                    selectedItems.has(uniqueId)
                                      ? "border-primary bg-primary/10"
                                      : "border-border bg-secondary/5 hover:border-primary/50"
                                  }`}
                                  onClick={() => {
                                    toggleItem(uniqueId);
                                  }}
                                >
                                  <div className="space-y-1 text-sm">
                                    {itemProps.map(([key, value]) => {
                                      if (value === null || value === undefined || value === "") return null;
                                      
                                      // Handle arrays (like keywords)
                                      if (Array.isArray(value)) {
                                        if (value.length === 0) return null;
                                        return (
                                          <div key={key} className="flex gap-2">
                                            <span className="font-medium capitalize">{key}:</span>
                                            <div className="flex flex-wrap gap-1">
                                              {value.map((v, i) => (
                                                <span key={i} className="rounded bg-primary/20 px-2 py-0.5 text-xs">
                                                  {String(v)}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      // Handle objects
                                      if (typeof value === "object") {
                                        return (
                                          <div key={key} className="flex gap-2">
                                            <span className="font-medium capitalize">{key}:</span>
                                            <span className="opacity-75">{JSON.stringify(value)}</span>
                                          </div>
                                        );
                                      }
                                      
                                      // Handle primitive values
                                      return (
                                        <div key={key} className="flex gap-2">
                                          <span className="font-medium capitalize">{key}:</span>
                                          <span className="opacity-75">{String(value)}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
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
