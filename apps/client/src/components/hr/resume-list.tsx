import { t } from "@lingui/macro";
import type { ResumeDto } from "@reactive-resume/dto";
import type { ReactNode } from "react";
import React from "react";
import { useNavigate } from "react-router";

type Props = {
  resumes?: ResumeDto[] | null;
  isLoading?: boolean;
  error?: unknown;
  className?: string;
  children?: ReactNode;
};

export const HRResumeList = ({ resumes, isLoading, error, className, children }: Props) => {
  const navigate = useNavigate();

  type ResumeData = Record<string, unknown>;

  const exportResume = (r: ResumeDto) => {
    const id = r.id;
    const originalData = (r as unknown as { data?: ResumeData }).data ?? {};
    const maybeSections = (originalData as unknown as { sections?: unknown }).sections;
    let sections: ResumeData = {};
    if (typeof maybeSections === "object" && maybeSections !== null) {
      sections = maybeSections as ResumeData;
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
                        navigate(`/hr/cv-preview/${id}`);
                      }}
                    >
                      {t`CV Preview`}
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default HRResumeList;
