import { t } from "@lingui/macro";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router";

export const HRResumePage = () => {
  const params = useParams() as { id?: string };
  const id = params.id ?? "";

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
          {t`Viewing resume for user`}: <strong>{id}</strong>
        </p>

        {/* TODO: fetch and render full resume data for the given id */}
      </div>
    </>
  );
};

export default HRResumePage;
