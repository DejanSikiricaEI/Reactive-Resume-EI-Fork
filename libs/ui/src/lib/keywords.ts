let cachedPromise: Promise<string[]> | null = null;
let cachedResult: string[] | null = null;

export function fetchKeywords(): Promise<string[]> {
  if (cachedResult) return Promise.resolve(cachedResult);
  if (cachedPromise) return cachedPromise;

  cachedPromise = fetch("/api/keywords")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch keywords: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cachedResult = Array.isArray(data) ? data : [];
      return cachedResult;
    })
    .catch((error: unknown) => {
      cachedPromise = null;
      throw error;
    });

  return cachedPromise;
}
