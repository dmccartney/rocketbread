import useK from "../hooks/useK";
import { Skeleton } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

export default function IsClaimedIcon({ nodeAddress, rewardIndex }) {
  let { data: isClaimed, isLoading } =
    useK.RocketMerkleDistributorMainnet.Read.isClaimed({
      args: [rewardIndex, nodeAddress],
    });
  if (isLoading) {
    return <Skeleton variant="circular" width={20} height={20} />;
  }
  if (isClaimed) {
    return <CheckCircle color="success" />;
  }
  return null;
}
