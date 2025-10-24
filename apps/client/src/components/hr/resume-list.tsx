import { t } from "@lingui/macro";
import type { ResumeDto } from "@reactive-resume/dto";
import type { ReactNode } from "react";
import React, { useState } from "react";

type Props = {
  resumes?: ResumeDto[] | null;
  isLoading?: boolean;
  error?: unknown;
  className?: string;
  children?: ReactNode;
};

export const HRResumeList = ({ resumes, isLoading, error, className, children }: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [editBuffers, setEditBuffers] = useState<Record<string, string>>({});
  const [parseErrors, setParseErrors] = useState<Record<string, string>>({});

  type ResumeData = Record<string, unknown>;

  const openEditor = (id: string, dataSections: ResumeData) => {
    setOpenId((cur) => (cur === id ? null : id));
    // initialize buffer only if not present
    setEditBuffers((cur) => ({
      ...cur,
      [id]: cur[id] ?? JSON.stringify(dataSections, null, 2),
    }));
    setParseErrors((cur) => ({ ...cur, [id]: "" }));
  };

  const updateBuffer = (id: string, value: string) => {
    setEditBuffers((cur) => ({ ...cur, [id]: value }));
    setParseErrors((cur) => ({ ...cur, [id]: "" }));
  };

  const saveBuffer = (id: string) => {
    const value = editBuffers[id];
    try {
      JSON.parse(value || "{}");
      setParseErrors((cur) => ({ ...cur, [id]: "" }));
      // only local UI save; integration with backend not included per request
      return true;
    } catch (error_) {
      const msg = error_ instanceof Error ? error_.message : String(error_);
      setParseErrors((cur) => ({ ...cur, [id]: msg }));
      return false;
    }
  };

  const exportResume = (r: ResumeDto) => {
    // Keep backwards-compatible JSON export (used as fallback and for "Export JSON")
    const id = r.id;
    const originalData = (r as unknown as { data?: ResumeData }).data ?? {};
    const maybeSections = (originalData as unknown as { sections?: unknown }).sections;
    let sections: ResumeData = {};
    if (typeof maybeSections === "object" && maybeSections !== null) {
      sections = maybeSections as ResumeData;
    }

    // prefer edited sections if available and valid
    if (editBuffers[id]) {
      try {
        const parsed = JSON.parse(editBuffers[id]);
        if (typeof parsed === "object" && parsed !== null) {
          sections = parsed as ResumeData;
        }
      } catch {
        // leave sections as original if parse fails
      }
    }

    const exported = {
      ...originalData,
      sections,
    };

    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = encodeURIComponent(r.title || "resume").replace(/%/g, "_");
    const fileName = `${safeTitle}-${id}.json`;
    a.href = url;
    a.download = fileName;
    // prefer append over appendChild
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Generate a .docx from a template (client-side) using PizZip + Docxtemplater.
  // Template should be available at /templates/docx/template.docx (place it in apps/client/public/templates/docx/)
  const exportDocx = async (r: ResumeDto) => {
    const id = r.id;
    const originalData = (r as unknown as { data?: ResumeData }).data ?? {};
    const maybeSections = (originalData as unknown as { sections?: unknown }).sections;
    let sections: ResumeData = {};
    if (typeof maybeSections === "object" && maybeSections !== null) {
      sections = maybeSections as ResumeData;
    }

    if (editBuffers[id]) {
      try {
        const parsed = JSON.parse(editBuffers[id]);
        if (typeof parsed === "object" && parsed !== null) {
          sections = parsed as ResumeData;
        }
      } catch {
        // parse failed — we'll still try with original sections
      }
    }

    const exported = {
      ...originalData,
      sections,
    };

    try {
      const templateUrls = ["/templates/docx/template.docx", "/template.docx"];

      let templateArrayBuffer: ArrayBuffer | null = null;
      for (const url of templateUrls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          templateArrayBuffer = await res.arrayBuffer();
          break;
        } catch {
          // try next
        }
      }

      if (!templateArrayBuffer) {
        // fallback to exporting JSON if template not found
        exportResume(r);
        return;
      }

      const PizZipModule = await import("pizzip");
      const DocxtemplaterModule = await import("docxtemplater");
      // Some bundlers expose default export, handle both cases
      const PizZip = PizZipModule.default ?? PizZipModule;
      const Docxtemplater = DocxtemplaterModule.default ?? DocxtemplaterModule;

      const zip = new PizZip(templateArrayBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      // Provide exported data to template. Template tags can reference properties like {{title}} or nested ones like {{sections.contact.email}}
      doc.setData(exported as Record<string, unknown>);

      try {
        doc.render();
      } catch (error_) {
        // rendering failed — fallback to JSON export
        // eslint-disable-next-line no-console
        console.error("Docx rendering error:", error_);
        exportResume(r);
        return;
      }

      const outBlob = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const outUrl = URL.createObjectURL(outBlob);
      const a = document.createElement("a");
      const safeTitle = encodeURIComponent(r.title || "resume").replace(/%/g, "_");
      const fileName = `${safeTitle}-${id}.docx`;
      a.href = outUrl;
      a.download = fileName;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(outUrl);
    } catch (error_) {
      // on any error, fallback to JSON export
      // eslint-disable-next-line no-console
      console.error(error_);
      exportResume(r);
    }
  };
  return (
    <div className={className}>
      {children}

      {isLoading && <div className="text-sm opacity-70">{t`Loading resumes...`}</div>}

      {Boolean(error) && (
        <div className="text-sm">
          <span className="text-error">{t`Unable to load resumes.`}</span>
        </div>
      )}

      {!isLoading && resumes && resumes.length === 0 && (
        <div className="text-sm opacity-70">{t`No resumes found for this user.`}</div>
      )}

      {!isLoading && resumes && resumes.length > 0 && (
        <ul className="space-y-3">
          {resumes.map((r) => {
            const id = r.id;
            const originalSections = r.data.sections;
            const isOpen = openId === id;

            return (
              <li key={id} className="rounded border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-sm opacity-70">
                      {new Date(r.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded bg-gray-100 px-3 py-1 text-sm"
                      onClick={() => {
                        openEditor(id, originalSections);
                      }}
                    >
                      {isOpen ? t`Close` : t`View / Edit`}
                    </button>
                    <button
                      type="button"
                      className="rounded bg-gray-100 px-3 py-1 text-sm"
                      onClick={() => {
                        void exportDocx(r);
                      }}
                    >
                      {t`Export`}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3">
                    <div className="mb-2 text-xs opacity-70">{t`Editing resume.data.sections (JSON)`}</div>
                    <textarea
                      className="h-48 w-full rounded border p-2 font-mono text-sm"
                      value={editBuffers[id] ?? JSON.stringify(originalSections, null, 2)}
                      onChange={(e) => {
                        updateBuffer(id, e.target.value);
                      }}
                    />

                    {parseErrors[id] && (
                      <div className="mt-2 text-sm text-error">
                        {t`JSON error:`} {parseErrors[id]}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="rounded bg-indigo-600 px-3 py-1 text-sm text-white"
                        onClick={() => {
                          saveBuffer(id);
                        }}
                      >
                        {t`Save`}
                      </button>
                      <button
                        type="button"
                        className="rounded bg-gray-100 px-3 py-1 text-sm"
                        onClick={() => {
                          exportResume(r);
                        }}
                      >
                        {t`Export JSON`}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default HRResumeList;
