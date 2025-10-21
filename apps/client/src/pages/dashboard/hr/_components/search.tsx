import { t } from "@lingui/macro";
import { Input } from "@reactive-resume/ui";
import { useQuery } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { axios } from "@/client/libs/axios";

type HRResult = {
  id: string;
  name?: string;
  email?: string;
  // additional fields returned by the API
  [key: string]: unknown;
};

export const HRSearch = () => {
  const [rawQuery, setRawQuery] = useState("");
  const [rawSkill, setRawSkill] = useState("");
  const [query, setQuery] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DELAY = 1500;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const fetchHR = useCallback(async () => {
    const res = await axios.get<HRResult[]>("/hr/search", { params: { q: query } });
    return res.data;
  }, [query]);

  const { data: results, isFetching } = useQuery({
    queryKey: ["hr-search", query],
    queryFn: fetchHR,
    enabled: query.length >= 2,
    keepPreviousData: true,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    // keep each input controlled independently
    if (name === "q") setRawQuery(value);
    else if (name === "skill") setRawSkill(value);

    // restart debounce timer on each change
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // if the value is very short, update query immediately
    if (value.length < 2) {
      setQuery(value);
      return;
    }

    timerRef.current = setTimeout(() => {
      setQuery(value);
      timerRef.current = null;
    }, DELAY);
  }

  return (
    <div className="space-y-2">
      {/* Shared handler used by both inputs - debounces and sets `query` to the last-changed input's value */}
      <Input
        name="q"
        placeholder={t`Search people, emails...`}
        value={rawQuery}
        onChange={handleChange}
      />

      <Input name="skill" placeholder={t`Skill..`} value={rawSkill} onChange={handleChange} />

      {isFetching && <div className="text-sm opacity-70">{t`Searching...`}</div>}

      {!isFetching && query.length >= 2 && (
        <ul className="max-h-52 divide-y overflow-auto rounded border bg-background/50">
          {results && results.length > 0 ? (
            results.map((r) => (
              <li key={r.id} className="px-4 py-2">
                <div className="font-medium">{r.name ?? r.id}</div>
                {r.email && <div className="text-sm opacity-70">{r.email}</div>}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm opacity-70">{t`No results found.`}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default HRSearch;
