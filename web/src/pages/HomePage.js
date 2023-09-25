import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import useK from "../hooks/useK";
import _ from "lodash";
import moment from "moment";
import Layout from "../components/Layout";
import WalletChip from "../components/WalletChip";
import useLocalJsonFile from "../hooks/useLocalJsonFile";
import { ethers } from "ethers";

function FinalizedIntervals() {
  let {
    isLoading,
    isError,
    error,
    remove,
    refetch,
    data: snapshots,
  } = useK.RocketRewardsPool.Find.RewardSnapshot({
    args: [],
    from: 0,
    to: "latest",
  });
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="overline">
          Finalized Intervals (on-chain)
        </Typography>
        <Chip
          onClick={() => {
            remove();
            refetch();
          }}
          label="Refresh"
          size="small"
        />
      </Stack>
      {isLoading && <Skeleton height={100} variant="rectangular" />}
      {isError && (
        <Alert severity="error">
          <AlertTitle>Error listing the finalized reward snapshots.</AlertTitle>
          {error?.message}
        </Alert>
      )}
      {snapshots && (
        <Stack spacing={1} direction="column-reverse">
          {snapshots
            .sort((a,b) => a.blockNumber - b.blockNumber)
            .map(({ args: [rewardIndex, , , endTime] }) => (
            <Card key={rewardIndex} elevation={5}>
              <CardActionArea component={Link} to={`/finalized/${rewardIndex}`}>
                <CardHeader
                  title={moment(1000 * endTime.toNumber()).fromNow()}
                  subheader={`Interval #${rewardIndex}`}
                />
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function useNextInterval() {
  let { data: snapshots } = useK.RocketRewardsPool.Find.RewardSnapshot({
    args: [],
    from: 0,
    to: "latest",
  });
  let last = _.max(
    (snapshots || []).map(({ args: [rewardIndex, , ,] }) =>
      rewardIndex.toNumber()
    )
  );
  return last ? last + 1 : undefined;
}

function useConsensusMemberCount() {
  let memberCount = useK.RocketDAONodeTrusted.Read.getMemberCount({}).data;
  let nodeConsensusThreshold =
    useK.RocketDAOProtocolSettingsNetwork.Read.getNodeConsensusThreshold(
      {}
    ).data;
  if (!memberCount || !nodeConsensusThreshold) {
    return null;
  }
  let requiredBased = memberCount.mul(nodeConsensusThreshold);
  let calcBase = ethers.utils.parseEther("1");
  let required = requiredBased.div(calcBase);
  if (requiredBased.mod(calcBase).gt(0)) {
    // Round up when there's a remainder
    return required.add(1).toNumber();
  }
  return required.toNumber();
}

function PendingInterval() {
  let nextInterval = useNextInterval();
  let {
    isLoading,
    isError,
    error,
    remove,
    refetch,
    data: snapshots,
  } = useK.RocketRewardsPool.Find.RewardSnapshotSubmitted({
    args: [null, nextInterval],
    from: 0,
    to: "latest",
  });
  let required = useConsensusMemberCount();
  if (!nextInterval || !required) {
    return null;
  }
  let answersByCID = _.groupBy(
    snapshots ?? [],
    ({ args: [from, rewardIndex, [, , , , merkleTreeCID], endTime] }) =>
      merkleTreeCID
  );
  let answerCIDs = _.orderBy(
    Object.keys(answersByCID),
    (cid) => answersByCID[cid].length,
    "desc"
  );
  let answerCount = answerCIDs.length;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="overline">
          Pending Interval #{nextInterval} (on-chain)
        </Typography>
        <Chip
          onClick={() => {
            remove();
            refetch();
          }}
          label="Refresh"
          size="small"
        />
      </Stack>
      {isLoading && <Skeleton height={100} variant="rectangular" />}
      {isError && (
        <Alert severity="error">
          <AlertTitle>Error listing the pending reward snapshots.</AlertTitle>
          {error?.message}
        </Alert>
      )}
      {!isLoading &&
        !isError &&
        (answerCount === 0 ? (
          <Alert severity="info">
            <AlertTitle>No submissions yet for the pending reward.</AlertTitle>
            oDAO members have not submitted any answers for the pending
            interval.
          </Alert>
        ) : answerCount > 1 ? (
          <Alert severity="info">
            <AlertTitle>Conflicting submissions</AlertTitle>
            oDAO members have submitted conflicting answers for the pending
            interval.
          </Alert>
        ) : null)}
      {answerCount > 0 && (
        <Stack spacing={1}>
          {answerCIDs.map((cid) => (
            <Card key={cid} elevation={5}>
              <CardActionArea
                component={Link}
                to={`/pending/${nextInterval}/${cid}`}
              >
                <CardHeader
                  title={`${cid.substring(0, 8)}...${cid.substring(
                    cid.length - 8
                  )}`}
                  subheader={
                    <>
                      {" "}
                      <LinearProgress
                        variant="determinate"
                        color="secondary"
                        sx={{
                          mt: 0.5,
                        }}
                        value={(100 * answersByCID[cid].length) / required}
                      />
                      <Typography
                        component="div"
                        variant="caption"
                        color="text.secondary"
                      >
                        {answersByCID[cid].length} of {required} required
                        submissions.
                      </Typography>
                    </>
                  }
                />
              </CardActionArea>
              <CardContent>
                {answersByCID[cid].map(
                  (
                    {
                      args: [
                        from,
                        rewardIndex,
                        [, , , , merkleTreeCID],
                        endTime,
                      ],
                    },
                    n
                  ) => (
                    <Box sx={{ display: "inline-block", mb: 2, mr: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mr: 0.5 }}
                      >
                        {n + 1}.
                      </Typography>
                      <WalletChip
                        avatarSize={24}
                        size="small"
                        key={from}
                        href={`https://rocketscan.io/address/${from}`}
                        target={"_blank"}
                        walletAddress={from}
                      />
                    </Box>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function LocalJsonFile() {
  let { file, clear } = useLocalJsonFile();
  if (!file) {
    return null;
  }
  let { fileId, fileName, openedAt } = file;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="overline">Local Files (offline)</Typography>
        <Chip onClick={() => clear()} label="Clear" size="small" />
      </Stack>
      <Stack spacing={1}>
        <Card key={fileId} elevation={5}>
          <CardActionArea component={Link} to={`/local/${fileId}`}>
            <CardHeader
              title={moment(openedAt).fromNow()}
              subheader={fileName}
            />
          </CardActionArea>
        </Card>
      </Stack>
    </Box>
  );
}

export default function HomePage() {
  return (
    <Layout>
      <Stack sx={{ mt: 3 }} spacing={3} alignItems="center">
        <Card sx={{ width: 600 }}>
          <CardHeader title="Select an interval (time period) to inspect:" />
          <CardContent>
            <Stack spacing={3}>
              <LocalJsonFile />
              <PendingInterval />
              <FinalizedIntervals />
              <Typography variant="body1">... or drop a JSON file.</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Layout>
  );
}
