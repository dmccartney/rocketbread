import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { makeSha1Hash } from "../utils";

// This is a React hook that stores a JSON file in local storage.

const QUERY_KEY = "localJsonFile";
export default function useLocalJsonFile() {
  let { data: file } = useQuery(QUERY_KEY, async () =>
    JSON.parse(localStorage.getItem(QUERY_KEY))
  );
  let client = useQueryClient();
  let navigate = useNavigate();
  return {
    file,
    set: async (file) => {
      let prepared = await prepareJsonFile(file);
      localStorage.setItem(
        QUERY_KEY,
        JSON.stringify({ ...prepared, openedAt: Date.now() })
      );
      await client.invalidateQueries(QUERY_KEY);
      // They probably want to navigate to the newly loaded file,
      // unless they're on a specific operators page.
      if (!(window.location.hash || "#/").startsWith("#/node")) {
        navigate(`/local/${prepared.fileId}`);
      }
    },
    clear: async () => {
      // Only navigate away if they're looking at the cleared file.
      if (window.location.hash === `#/local/${file?.fileId}`) {
        navigate(`/`);
      }
      localStorage.removeItem(QUERY_KEY);
      await client.invalidateQueries(QUERY_KEY);
    },
  };
}

// This decodes, hashes, and parses a JSON file.
// It is used during drag-and-drop and file-dialog flows.
async function prepareJsonFile(file) {
  let buffer = await file.arrayBuffer();
  let fileId = await makeSha1Hash(buffer);
  let jsonText = new TextDecoder("utf-8").decode(buffer);
  let json = JSON.parse(jsonText);
  let fileName = file.name;
  return {
    fileId,
    fileName,
    json,
  };
}
