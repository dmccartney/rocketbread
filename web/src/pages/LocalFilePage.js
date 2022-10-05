import Layout from "../components/Layout";
import RewardSummary from "../components/RewardSummary";
import { useParams } from "react-router";
import useLocalJsonFile from "../hooks/useLocalJsonFile";
import { Typography } from "@mui/material";

export default function LocalFilePage() {
  let { fileId } = useParams();
  let { file } = useLocalJsonFile();
  return (
    <Layout
      breadcrumbs={[
        { label: "Rewards", href: "/" },
        {
          label: file ? (
            <>
              Unfinalized Interval #{file.json.index}{" "}
              <Typography
                fontSize="small"
                color="text.secondary"
                variant="code"
              >
                {file?.fileName}
              </Typography>
            </>
          ) : (
            `Unfinalized Interval`
          ),
          href: `/local/${fileId}`,
        },
      ]}
    >
      {file && <RewardSummary rewards={file.json} />}
      {!file && <div>File not found</div>}
    </Layout>
  );
}
