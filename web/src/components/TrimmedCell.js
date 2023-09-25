
import { ethers } from "ethers";

export default function TrimmedCell({ value }) {
  let valueFormatted = ethers.utils.commify(ethers.utils.formatUnits(value))
  return (
    <span
      title={valueFormatted}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        marginLeft: "2em",
      }}
    >
      {valueFormatted}
    </span>
  );
}
