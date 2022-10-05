import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import useK from "../hooks/useK";
import moment from "moment";
import Layout from "../components/Layout";
import useLocalJsonFile from "../hooks/useLocalJsonFile";

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
          {snapshots.map(({ args: [rewardIndex, , , endTime] }) => (
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
              <FinalizedIntervals />
              <Typography variant="body1">... or drop a JSON file.</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Layout>
  );
}
