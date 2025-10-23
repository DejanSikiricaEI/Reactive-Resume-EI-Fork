import { t } from "@lingui/macro";
import type { ResumeDto } from "@reactive-resume/dto";
import type { ReactNode } from "react";

type Props = {
  resumes?: ResumeDto[] | null;
  isLoading?: boolean;
  error?: unknown;
  className?: string;
  children?: ReactNode;
};

export const HRResumeList = ({ resumes, isLoading, error, className, children }: Props) => {
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
          {resumes.map((r) => (
            <li key={r.id} className="rounded border p-3">
              <div className="font-medium">{r.title}</div>
              <div className="text-sm opacity-70">{new Date(r.updatedAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HRResumeList;
