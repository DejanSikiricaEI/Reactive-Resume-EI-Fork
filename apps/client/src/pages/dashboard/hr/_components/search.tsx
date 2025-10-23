import { t } from "@lingui/macro";
import { Input } from "@reactive-resume/ui";
import { useQuery } from "@tanstack/react-query";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { axios } from "@/client/libs/axios";

type HRResult = {
  id: string;
  name?: string;
  email?: string;
  // additional fields returned by the API
  [key: string]: unknown;
};

export const HRSearch = () => {
  const [filters, setFilters] = useState({ person: "", skill: "" });
  const [searchTrigger, setSearchTrigger] = useState(0);

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

  const fetchHR = async () => {
    const res = await axios.get<HRResult[]>("/hr/search", {
      params: {
        person: filters.person,
        skill: filters.skill,
      },
    });
    return res.data;
  };

  const { data: results, isFetching } = useQuery({
    queryKey: ["hr-search", searchTrigger],
    queryFn: fetchHR,
    enabled: searchTrigger > 0,
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setTimeout(() => {
      if (filters.person.length >= 2 || filters.skill.length >= 2) {
        setSearchTrigger((s) => s + 1);
      }
      timerRef.current = null;
    }, DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [filters.person, filters.skill]);

  return (
    <div className="space-y-2">
      <Input
        name="person"
        placeholder={t`Search people, emails...`}
        value={filters.person}
        onChange={handleChange}
      />

      <Input
        name="skill"
        placeholder={t`Enter skills, separated by commas`}
        value={filters.skill}
        onChange={handleChange}
      />

      {isFetching && <div className="text-sm opacity-70">{t`Searching...`}</div>}

      {!isFetching && (filters.person.length >= 2 || filters.skill.length >= 2) && (
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
