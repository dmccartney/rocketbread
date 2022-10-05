import { useQuery } from "wagmi";

export default function useFetchJSON(url, options) {
  return useQuery(
    ["fetchJSON", url],
    async () => {
      let res = await fetch(url);
      if (!res.ok) {
        throw new Error(`failure fetching JSON from ${url}`);
      }
      return res.json();
    },
    {
      ...options,
    }
  );
}
