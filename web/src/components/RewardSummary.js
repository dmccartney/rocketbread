import {
  Alert,
  AlertTitle,
  Card,
  CardHeader,
  CardMedia,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Tooltip as MuiTooltip,
} from "@mui/material";
import { HelpOutline, OpenInNew } from "@mui/icons-material";
import { useState } from "react";
import { BigNumber, ethers } from "ethers";
import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import deepPurple from "@mui/material/colors/deepPurple";
import { DataGrid } from "@mui/x-data-grid";
import WalletChip from "./WalletChip";
import { BNSortComparator, etherscanUrl } from "../utils";
import { useEnsAddress } from "wagmi";
import moment from "moment/moment";
import { useSearchParams } from "react-router-dom";
import IsClaimedIcon from "./IsClaimedIcon";
import TrimmedCell from "./TrimmedCell";

export default function RewardSummary({ rewards, snapshot = null }) {
  let [pageSize, setPageSize] = useState(10);
  let [search, setSearch] = useSearchParams();
  let [filter, setFilter] = useState(search.get("q") || "");
  let { data: filterAddress } = useEnsAddress({
    name: filter,
    enabled: filter?.endsWith(".eth"),
  });
  let { index: rewardIndex, totalRewards, nodeRewards } = rewards;
  let { protocolDaoRpl, totalCollateralRpl, totalOracleDaoRpl } = totalRewards;
  let {
    totalSmoothingPoolEth,
    poolStakerSmoothingPoolEth,
    nodeOperatorSmoothingPoolEth,
  } = totalRewards;
  let nodeAddresses = Object.keys(nodeRewards);
  const asNumber = (nText) => Number(ethers.utils.formatUnits(nText));
  const addAll = (...args) =>
    args.reduce(
      (a, b) => a.add(ethers.BigNumber.from(b)),
      ethers.BigNumber.from(0)
    );
  const rplData = [
    {
      name: "Operators",
      value: asNumber(totalCollateralRpl),
    },
    {
      name: "pDAO",
      value: asNumber(protocolDaoRpl),
    },
    {
      name: "oDAO",
      value: asNumber(totalOracleDaoRpl),
    },
  ];
  const smoothingEthData = [
    {
      name: "Operators",
      value: asNumber(nodeOperatorSmoothingPoolEth),
    },
    {
      name: "rETH",
      value: asNumber(poolStakerSmoothingPoolEth),
    },
  ].filter(({ value }) => value > 0);
  const rplTotal = addAll(
    totalCollateralRpl,
    protocolDaoRpl,
    totalOracleDaoRpl
  );
  let startTime = snapshot
    ? moment(1000 * snapshot.args[2].toNumber())
    : moment(rewards.startTime);
  let endTime = snapshot
    ? moment(1000 * snapshot.args[3].toNumber())
    : moment(rewards.endTime);

  return (
    <>
      <Grid container sx={{ mb: 2 }} columnSpacing={2}>
        <Grid item xs={4}>
          <Stack spacing={2}>
            <TextField
              placeholder="find operator by address or ENS"
              value={filter}
              fullWidth
              autoFocus
              helperText={filterAddress}
              onChange={(e) => {
                let q = e.target.value.toLowerCase() || "";
                setFilter(q);
                setSearch(q ? { q } : {}, { replace: true });
              }}
            />

            <Alert
              severity={snapshot ? "success" : "warning"}
              action={
                snapshot && (
                  <IconButton
                    href={etherscanUrl({ tx: snapshot.transactionHash })}
                    color="inherit"
                    target="_blank"
                  >
                    <OpenInNew fontSize="inherit" />
                  </IconButton>
                )
              }
            >
              <AlertTitle>
                {/* endTime = args[3] */}
                {snapshot
                  ? `Finalized ${endTime.fromNow()}`
                  : "Unfinalized"}{" "}
                (duration {moment.duration(endTime.diff(startTime)).days()}d)
              </AlertTitle>
              {startTime.format("MMM DD YYYY")}
              {" • "}
              {endTime.format("MMM DD YYYY")}
            </Alert>
          </Stack>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardHeader
              title={`${asNumber(rplTotal).toLocaleString()} RPL`}
              subheader={
                <>
                  RPL Inflation Rewards{" "}
                  <MuiTooltip title="TODO" sx={{ cursor: "help" }}>
                    <HelpOutline fontSize="inherit" />
                  </MuiTooltip>
                </>
              }
            />
            <CardMedia>
              <ResponsiveContainer height={64} width="100%">
                <Treemap data={rplData} isAnimationActive={false}>
                  <Tooltip
                    formatter={(value, name, item) => [
                      value.toLocaleString(),
                      `${item.payload.name} RPL`,
                    ]}
                  />
                </Treemap>
              </ResponsiveContainer>
            </CardMedia>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardHeader
              title={`${asNumber(totalSmoothingPoolEth).toLocaleString()} ETH`}
              subheader={
                <>
                  Smoothing Pool ETH Rewards{" "}
                  <MuiTooltip title="TODO" sx={{ cursor: "help" }}>
                    <HelpOutline fontSize="inherit" />
                  </MuiTooltip>
                </>
              }
            />
            <CardMedia>
              {BigNumber.from(totalSmoothingPoolEth).isZero() ? (
                <Skeleton
                  sx={{ m: 0 }}
                  variant="rectangular"
                  animation={false}
                  height={64}
                />
              ) : (
                <ResponsiveContainer height={64} width="100%">
                  <Treemap
                    data={smoothingEthData}
                    colorPanel={[deepPurple.A200]}
                    isAnimationActive={false}
                  >
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </Treemap>
                </ResponsiveContainer>
              )}
            </CardMedia>
          </Card>
        </Grid>
      </Grid>
      <DataGrid
        sx={{ minHeight: 400 }}
        autoHeight
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pagination
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        rows={nodeAddresses
          .filter(
            (nodeAddress) =>
              !filter ||
              nodeAddress.toLowerCase().indexOf(filter) !== -1 ||
              (filterAddress &&
                nodeAddress.toLowerCase() === filterAddress.toLowerCase())
          )
          .map((nodeAddress) => ({
            nodeAddress,
            ...nodeRewards[nodeAddress],
          }))}
        getRowId={({ nodeAddress }) => nodeAddress}
        columns={[
          {
            field: "nodeAddress",
            type: "string",
            headerName: "Operator",
            width: 250,
            sortable: false,
            renderCell: ({ value }) => {
              return (
                <WalletChip
                  walletAddress={value}
                  to={(addressOrName) => `/node/${addressOrName}`}
                />
              );
            },
          },
          {
            field: "isClaimed",
            headerName: "Claimed",
            type: "boolean",
            width: 100,
            sortable: false,
            renderCell: ({ row }) => {
              return (
                <IsClaimedIcon
                  rewardIndex={rewardIndex}
                  nodeAddress={row.nodeAddress}
                />
              );
            },
          },
          {
            field: "totalRpl",
            type: "number",
            headerName: "RPL (total)",
            width: 125,
            sortComparator: BNSortComparator,
            valueGetter: ({ row: { collateralRpl, oracleDaoRpl } }) => {
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
            width: 125,
            sortComparator: BNSortComparator,
            valueGetter: ({ value }) => {
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
            width: 125,
            sortComparator: BNSortComparator,
            valueGetter: ({ value }) => {
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
            width: 125,
            sortComparator: BNSortComparator,
            valueGetter: ({ value }) => {
              return ethers.BigNumber.from(value);
            },
            renderCell: (params) => (
              <TrimmedCell value={params.value || 0} />
            ),
          },
        ]}
        initialState={{
          sorting: {
            sortModel: [
              {
                field: "totalRpl",
                sort: "desc",
              },
            ],
          },
        }}
        disableSelectionOnClick
      />
    </>
  );
}
