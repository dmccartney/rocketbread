import Layout from "../components/Layout";
import { useParams } from "react-router";
import useLocalJsonFile from "../hooks/useLocalJsonFile";
import { useEnsAddress, useEnsName } from "wagmi";
import { Card, CardActionArea, CardHeader, Chip, Grid } from "@mui/material";
import {
  BNSortComparator,
  rocketscanUrl,
  shortenAddress,
} from "../utils";
import { OpenInNew } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import useK from "../hooks/useK";
import IsClaimedIcon from "../components/IsClaimedIcon";
import { useState } from "react";
import useFetchJSONZST from "../hooks/useFetchJSONZST";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import TrimmedCell from "../components/TrimmedCell";

// const IPFS_BASE = "https://ipfs.io";
const IPFS_BASE = "https://cloudflare-ipfs.com";
function useSnapshotJSONs({ snapshots, network = "mainnet" }) {
  return useFetchJSONZST(
    (snapshots || [])
      .map(({ args: [rewardIndex, submission] }) => ({
        rewardIndex: rewardIndex.toNumber(),
        merkleTreeCID: submission[4],
      }))
      .map(
        ({ rewardIndex, merkleTreeCID }) =>
          `${IPFS_BASE}/ipfs/${merkleTreeCID}/rp-rewards-${network}-${rewardIndex}.json.zst`
      )
  );
}

const USER_COLS = [
  {
    field: "rewardIndex",
    headerName: "Interval",
    width: 200,
    renderCell: ({ row: { type, rewardIndex, file, nodeAddressOrName } }) => {
      if (type === "local") {
        return (
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            clickable
            component={Link}
            to={`/local/${file.fileId}?q=${nodeAddressOrName}`}
            label={`Unfinalized Interval #${rewardIndex}`}
          />
        );
      }
      return (
        <Chip
          size="small"
          variant="contained"
          // color="primary"
          clickable
          component={Link}
          to={`/finalized/${rewardIndex}?q=${nodeAddressOrName}`}
          label={`Finalized Interval #${rewardIndex}`}
        />
      );
    },
  },
  {
    field: "isClaimed",
    headerName: "Claimed",
    width: 100,
    sortable: false,
    renderCell: ({ row: { type, nodeAddress, rewardIndex } }) => {
      if (type === "local") {
        return "--";
      }
      return (
        <IsClaimedIcon rewardIndex={rewardIndex} nodeAddress={nodeAddress} />
      );
    },
  },
  {
    field: "totalRpl",
    type: "number",
    headerName: "RPL (total)",
    width: 110,
    sortComparator: BNSortComparator,
    valueGetter: ({ row: { collateralRpl, oracleDaoRpl } }) => {
      if (!collateralRpl) {
        return ethers.BigNumber.from(0);
      }
      return ethers.BigNumber.from(collateralRpl).add(
        ethers.BigNumber.from(oracleDaoRpl)
      );
    },
    renderCell: (params) => (
      <TrimmedCell value={params.value || 0} />
    ),
  },
  {
    field: "collateralRpl",
    type: "number",
    headerName: "RPL (collateral)",
    width: 150,
    sortComparator: BNSortComparator,
    valueGetter: ({ value }) => {
      if (!value) {
        return ethers.BigNumber.from(0);
      }
      return ethers.BigNumber.from(value);
    },
    renderCell: (params) => (
      <TrimmedCell value={params.value || 0} />
    ),
  },
  {
    field: "oracleDaoRpl",
    type: "number",
    headerName: "RPL (oDAO)",
    width: 115,
    sortComparator: BNSortComparator,
    valueGetter: ({ value }) => {
      if (!value) {
        return ethers.BigNumber.from(0);
      }
      return ethers.BigNumber.from(value);
    },
    renderCell: (params) => (
      <TrimmedCell value={params.value || 0} />
    ),
  },
  {
    field: "smoothingPoolEth",
    type: "number",
    headerName: "ETH (smoothing)",
    width: 150,
    sortComparator: BNSortComparator,
    valueGetter: ({ value }) => {
      if (!value) {
        return ethers.BigNumber.from(0);
      }
      return ethers.BigNumber.from(value);
    },
    renderCell: (params) => (
      <TrimmedCell value={params.value || 0} />
    ),
  },
];
const USER_COL_WIDTH =
  USER_COLS.reduce((total, { width }) => total + width, 0) + 2;

function NodeRewards({ nodeAddress }) {
  let [pageSize, setPageSize] = useState(10);
  let { file } = useLocalJsonFile();
  let ensName = useEnsName({
    address: nodeAddress,
  });
  let { data: snapshots } = useK.RocketRewardsPool.Find.RewardSnapshot({
    args: [],
    from: 0,
    to: "latest",
  });
  let snapshotJsons = useSnapshotJSONs({ snapshots });
  let nodeAddressOrName = ensName.data || nodeAddress;
  let rows = []
    .concat(
      (file ? [file] : []).map((file) => ({
        type: "local",
        nodeAddress,
        nodeAddressOrName,
        rewardIndex: file.json.index,
        file,
        ...(file.json.nodeRewards[nodeAddress.toLowerCase()] || {}),
      }))
    )
    .concat(
      (snapshots || []).map(({ args: [rewardIndex] }, i) => ({
        type: "finalized",
        nodeAddress,
        nodeAddressOrName,
        rewardIndex: rewardIndex.toNumber(),
        ...(snapshotJsons[i]?.data?.nodeRewards[nodeAddress.toLowerCase()] ||
          {}),
      }))
    );
  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <Card>
          <CardActionArea
            href={rocketscanUrl({ node: nodeAddressOrName })}
            target="_blank"
          >
            <CardHeader
              title={ensName.data || shortenAddress(nodeAddress)}
              action={<OpenInNew sx={{ mt: 1, mr: 1 }} />}
            />
          </CardActionArea>
        </Card>
      </Grid>
      <Grid item xs={9}>
        <DataGrid
          sx={{ minHeight: 400, width: USER_COL_WIDTH }}
          autoHeight
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pagination
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          rows={rows}
          getRowId={({ type, rewardIndex }) =>
            type === "local" ? "local" : rewardIndex
          }
          columns={USER_COLS}
          initialState={{
            sorting: {
              sortModel: [
                {
                  field: "rewardIndex",
                  sort: "desc",
                },
              ],
            },
          }}
          disableSelectionOnClick
        />
      </Grid>
    </Grid>
  );
}

export default function NodePage() {
  let { nodeAddressOrName } = useParams();
  let { data: nodeAddress } = useEnsAddress({
    name: nodeAddressOrName,
    enabled: nodeAddressOrName.endsWith(".eth"),
  });
  if (!nodeAddressOrName.endsWith(".eth")) {
    nodeAddress = nodeAddressOrName;
  }
  return (
    <Layout
      breadcrumbs={[
        { label: "Rewards", href: "/" },
        {
          label: `Node: ${nodeAddressOrName}`,
          href: `/node/${nodeAddressOrName}`,
        },
      ]}
    >
      {nodeAddress && <NodeRewards nodeAddress={nodeAddress} />}
      {!nodeAddress && <div>Loading...</div>}
    </Layout>
  );
}
