import Layout from "../components/Layout";
import RewardSummary from "../components/RewardSummary";
import { useParams } from "react-router";
import { Alert, AlertTitle, CircularProgress } from "@mui/material";
import useK from "../hooks/useK";
import useFetchJSONZST from "../hooks/useFetchJSONZST";

// const IPFS_BASE = "https://ipfs.io";
const IPFS_BASE = "https://cloudflare-ipfs.com";
function usePendingRewards({
  intervalIndex,
  merkleTreeCID,
  network = "mainnet",
}) {
  let { data: snapshot } = useK.RocketRewardsPool.Find.RewardSnapshotSubmitted({
    args: [intervalIndex],
    from: 0,
    to: "latest",
  });
  snapshot = snapshot?.filter((s) => s.args[1][4] === merkleTreeCID)[0] || null;
  let ipfsUrl = `${IPFS_BASE}/ipfs/${merkleTreeCID}/rp-rewards-${network}-${intervalIndex}.json.zst`;
  let fetching = useFetchJSONZST(ipfsUrl, { enabled: !!merkleTreeCID });
  return {
    snapshot,
    ...fetching,
  };
}

export default function PendingIntervalPage() {
  let { intervalIndex, merkleTreeCID } = useParams();
  let {
    snapshot,
    data: rewards,
    isLoading,
    isError,
    error,
  } = usePendingRewards({ intervalIndex, merkleTreeCID });
  return (
    <Layout
      breadcrumbs={[
        { label: "Rewards", href: "/" },
        {
          label: `Pending Interval #${intervalIndex}`,
          href: `/pending/${intervalIndex}/${merkleTreeCID}`,
        },
      ]}
    >
      {rewards && <RewardSummary rewards={rewards} snapshot={snapshot} />}
      {isLoading && <CircularProgress />}
      {isError && (
        <Alert severity="error">
          <AlertTitle>Error loading the pending reward snapshot.</AlertTitle>
          {error?.message}
        </Alert>
      )}
    </Layout>
  );
}
