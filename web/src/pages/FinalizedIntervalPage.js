import Layout from "../components/Layout";
import RewardSummary from "../components/RewardSummary";
import { useParams } from "react-router";
import useK from "../hooks/useK";
import useFetchJSONZST from "../hooks/useFetchJSONZST";
import { Alert, AlertTitle, CircularProgress } from "@mui/material";

// const IPFS_BASE = "https://ipfs.io";
const IPFS_BASE = "https://cloudflare-ipfs.com";
function useFinalizedRewards({ intervalIndex, network = "mainnet" }) {
  let { data: snapshot } = useK.RocketRewardsPool.Find.RewardSnapshot({
    args: [intervalIndex],
    from: 0,
    to: "latest",
  });
  snapshot = snapshot?.length ? snapshot[0] : null;
  // args.submission.merkleTreeCID
  let merkleTreeCID = snapshot ? snapshot.args[1][4] : null;
  let ipfsUrl = `${IPFS_BASE}/ipfs/${merkleTreeCID}/rp-rewards-${network}-${intervalIndex}.json.zst`;
  let fetching = useFetchJSONZST(ipfsUrl, { enabled: !!merkleTreeCID });
  return {
    snapshot,
    ...fetching,
  };
}

export default function FinalizedIntervalPage() {
  let { intervalIndex } = useParams();
  let {
    snapshot,
    data: rewards,
    isLoading,
    isError,
    error,
  } = useFinalizedRewards({ intervalIndex });
  return (
    <Layout
      breadcrumbs={[
        { label: "Rewards", href: "/" },
        {
          label: `Finalized Interval #${intervalIndex}`,
          href: `/finalized/${intervalIndex}`,
        },
      ]}
    >
      {rewards && <RewardSummary rewards={rewards} snapshot={snapshot} />}
      {isLoading && <CircularProgress />}
      {isError && (
        <Alert severity="error">
          <AlertTitle>Error loading the finalized reward snapshot.</AlertTitle>
          {error?.message}
        </Alert>
      )}
    </Layout>
  );
}
