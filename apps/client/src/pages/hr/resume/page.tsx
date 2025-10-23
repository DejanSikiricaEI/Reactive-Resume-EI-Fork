import { t } from "@lingui/macro";
import type { ResumeDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router";

import { axios } from "@/client/libs/axios";

const fetchResumesForUser = async (userId: string) => {
  const res = await axios.get<ResumeDto[]>(`/hr/resumes/${userId}`);
  return res.data;
};

export const HRResumePage = () => {
  const params = useParams() as { id?: string };
  const id = params.id ?? "";

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

      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">{t`HR Resume`}</h1>

        <p className="text-sm opacity-70">
          {t`Viewing resumes for user`}: <strong>{id}</strong>
        </p>

        {isFetching && <div className="text-sm opacity-70">{t`Loading resumes...`}</div>}

        {error && (
          <div className="text-sm">
            <span className="text-error">{t`Unable to load resumes.`}</span>
          </div>
        )}

        {!isFetching && resumes && resumes.length === 0 && (
          <div className="text-sm opacity-70">{t`No resumes found for this user.`}</div>
        )}

        {!isFetching && resumes && resumes.length > 0 && (
          <ul className="space-y-3">
            {resumes.map((r) => (
              <li key={r.id} className="rounded border p-3">
                <div className="font-medium">{r.title}</div>
                <div className="text-sm opacity-70">{r.slug}</div>
                <div className="text-sm opacity-70">{new Date(r.updatedAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default HRResumePage;
