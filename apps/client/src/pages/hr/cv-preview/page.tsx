import { t } from "@lingui/macro";
import { DownloadSimpleIcon, SidebarSimpleIcon } from "@phosphor-icons/react";
import type { ResumeDto } from "@reactive-resume/dto";
import { Button, Sheet, SheetClose, SheetContent, SheetTrigger } from "@reactive-resume/ui";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router";

import { axios } from "@/client/libs/axios";

import { Sidebar } from "../../dashboard/_components/sidebar";

const getDisplayLabel = (key: string): string => {
  if (key.toLowerCase() === "keywords") return t`Technologies`;
  return key;
};

const fetchResume = async (id: string) => {
  const res = await axios.get<ResumeDto>(`/hr/resume/${id}`);
  return res.data;
};

export const CVPreviewPage = () => {
  const params = useParams() as { id?: string };
  const id = params.id ?? "";
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});

  const {
    data: resume,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["cv-preview", id],
    queryFn: () => fetchResume(id),
    enabled: id.length > 0,
  });

  const toggleField = (path: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const toggleSection = (section: string, value: boolean) => {
    if (!resume?.data) return;
    
    const updates: Record<string, boolean> = {};
    
    if (section === "basics") {
      for (const key of Object.keys(resume.data.basics)) {
        updates[`basics.${key}`] = value;
      }
    } else {
      const sectionData = resume.data.sections[section as keyof typeof resume.data.sections];
      if (typeof sectionData === "object") {
        for (const key of Object.keys(sectionData)) {
          updates[`sections.${section}.${key}`] = value;
        }
      }
    }
    
    setSelectedFields((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const exportSelected = () => {
    if (!resume?.data) return;

    const result: Record<string, unknown> = {};
    const arrayIndexRegex = /^(.+)\[(\d+)]$/;

    const setValue = (obj: Record<string, unknown>, pathParts: string[], value: unknown) => {
      let current: Record<string, unknown> | unknown[] = obj;

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const arrayMatch = arrayIndexRegex.exec(part);

        if (arrayMatch) {
          const key = arrayMatch[1];
          const index = Number.parseInt(arrayMatch[2], 10);

          const currentObj = current as Record<string, unknown>;
          currentObj[key] ??= [];
          const arr = currentObj[key] as unknown[];
          arr[index] ??= {};
          current = arr[index] as Record<string, unknown> | unknown[];
        } else {
          const currentObj = current as Record<string, unknown>;
          currentObj[part] ??= {};
          current = currentObj[part] as Record<string, unknown> | unknown[];
        }
      }

      const lastPart = pathParts.at(-1);
      if (!lastPart) return;

      const arrayMatch = arrayIndexRegex.exec(lastPart);

      if (arrayMatch) {
        const key = arrayMatch[1];
        const index = Number.parseInt(arrayMatch[2], 10);
        const currentObj = current as Record<string, unknown>;
        currentObj[key] ??= [];
        (currentObj[key] as unknown[])[index] = value;
      } else {
        (current as Record<string, unknown>)[lastPart] = value;
      }
    };

    const getValue = (obj: unknown, pathParts: string[]): unknown => {
      let current = obj;

      for (const part of pathParts) {
        const arrayMatch = arrayIndexRegex.exec(part);

        if (arrayMatch) {
          const key = arrayMatch[1];
          const index = Number.parseInt(arrayMatch[2], 10);

          if (current && typeof current === "object" && key in current) {
            const arr = (current as Record<string, unknown>)[key];
            if (Array.isArray(arr) && index < arr.length) {
              current = arr[index];
            } else {
              return undefined;
            }
          } else {
            return undefined;
          }
        } else {
          if (current && typeof current === "object" && part in current) {
            current = (current as Record<string, unknown>)[part];
          } else {
            return undefined;
          }
        }
      }

      return current;
    };

    for (const path of Object.keys(selectedFields)) {
      if (!selectedFields[path]) continue;

      const parts = path.split(".");
      const value = getValue(resume.data, parts);

      if (value !== undefined) {
        setValue(result, parts, value);
      }
    }

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = encodeURIComponent(resume.title || "cv-preview").replace(/%/g, "_");
    a.href = url;
    a.download = `${safeTitle}-selected.json`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const renderObject = (obj: Record<string, unknown>, path: string, level = 0) => {
    const hiddenFields = new Set(["id", "visible", "separatelinks", "columns"]);

    return (
      <div className="space-y-1" style={{ marginLeft: `${level * 16}px` }}>
        {Object.entries(obj).map(([key, value]) => {
          // Skip hidden fields
          if (hiddenFields.has(key.toLowerCase())) {
            return null;
          }

          const fieldPath = path ? `${path}.${key}` : key;
          const isChecked = selectedFields[fieldPath] || false;
          const displayLabel = getDisplayLabel(key);

          if (value && typeof value === "object" && !Array.isArray(value)) {
            return (
              <div key={fieldPath} className="space-y-1">
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    className="size-4 cursor-pointer"
                    onChange={() => {
                      toggleField(fieldPath);
                    }}
                  />
                  <span className="text-sm font-medium">{displayLabel}</span>
                </div>
                {renderObject(value as Record<string, unknown>, fieldPath, level + 1)}
              </div>
            );
          }

          if (Array.isArray(value)) {
            // Hide empty arrays
            if (value.length === 0) {
              return null;
            }

            return (
              <div key={fieldPath} className="space-y-1">
                <div className="flex items-center gap-2 py-1">
                  <span className="text-sm font-medium">{displayLabel}</span>
                </div>
                <div className="space-y-2" style={{ marginLeft: `${(level + 1) * 16}px` }}>
                  {value.map((item, index) => {
                    const itemPath = `${fieldPath}[${index}]`;
                    const itemChecked = selectedFields[itemPath] || false;
                    const isNotFirst = index > 0;

                    if (item && typeof item === "object" && !Array.isArray(item)) {
                      return (
                        <div key={itemPath} className="space-y-1">
                          {isNotFirst && (
                            <div className="my-2 border-t border-gray-200 opacity-80" />
                          )}
                          {renderObject(item as Record<string, unknown>, itemPath, level + 1)}
                        </div>
                      );
                    }

                    if (Array.isArray(item)) {
                      return (
                        <div key={itemPath} className="space-y-1">
                          <div
                            className="space-y-1"
                            style={{ marginLeft: `${(level + 1) * 16}px` }}
                          >
                            {item.map((subItem, subIndex) => {
                              const subPath = `${itemPath}[${subIndex}]`;
                              return (
                                <div key={subPath} className="flex items-center gap-2 py-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedFields[subPath] || false}
                                    className="size-4 cursor-pointer"
                                    onChange={() => {
                                      toggleField(subPath);
                                    }}
                                  />
                                  <span className="text-sm opacity-70">
                                    <span className="font-mono text-xs">{String(subItem)}</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={itemPath} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={itemChecked}
                          className="size-4 cursor-pointer"
                          onChange={() => {
                            toggleField(itemPath);
                          }}
                        />
                        <span className="text-sm opacity-70">
                          <span className="font-mono text-xs">{String(item)}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={fieldPath} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={isChecked}
                className="size-4 cursor-pointer"
                onChange={() => {
                  toggleField(fieldPath);
                }}
              />
              <span className="text-sm">
                <span className="opacity-70">{displayLabel}:</span>{" "}
                <span className="font-mono text-xs">
                  {typeof value === "string" && value.length > 50
                    ? `${value.slice(0, 50)}...`
                    : String(value)}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>
          {t`CV Preview`} - {t`Reactive Resume`}
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
        <div className="max-w-5xl space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t`CV Preview with Field Selection`}</h1>
            <Button
              disabled={Object.values(selectedFields).filter(Boolean).length === 0}
              className="gap-2"
              onClick={exportSelected}
            >
              <DownloadSimpleIcon size={16} />
              {t`Export Selected`}
            </Button>
          </div>

          {isFetching && <div className="text-sm opacity-70">{t`Loading resume...`}</div>}

          {Boolean(error) && <div className="text-sm text-error">{t`Unable to load resume.`}</div>}

          {!isFetching && resume && (
            <div className="space-y-6">
              <div className="rounded border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{t`Basics`}</h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs opacity-70 hover:opacity-100"
                      onClick={() => {
                        toggleSection("basics", true);
                      }}
                    >
                      {t`Select All`}
                    </button>
                    <span className="opacity-30">|</span>
                    <button
                      type="button"
                      className="text-xs opacity-70 hover:opacity-100"
                      onClick={() => {
                        toggleSection("basics", false);
                      }}
                    >
                      {t`Deselect All`}
                    </button>
                  </div>
                </div>
                {renderObject(resume.data.basics as Record<string, unknown>, "basics")}
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t`Sections`}</h2>
                {Object.entries(resume.data.sections).map(([sectionKey, sectionValue]) => (
                  <div key={sectionKey} className="rounded border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-medium capitalize">{sectionKey}</h3>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-xs opacity-70 hover:opacity-100"
                          onClick={() => {
                            toggleSection(sectionKey, true);
                          }}
                        >
                          {t`Select All`}
                        </button>
                        <span className="opacity-30">|</span>
                        <button
                          type="button"
                          className="text-xs opacity-70 hover:opacity-100"
                          onClick={() => {
                            toggleSection(sectionKey, false);
                          }}
                        >
                          {t`Deselect All`}
                        </button>
                      </div>
                    </div>
                    {renderObject(
                      sectionValue as Record<string, unknown>,
                      `sections.${sectionKey}`,
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CVPreviewPage;
