import { ethers } from "ethers";

// Trim the input address to be "0x####...####"
export function shortenAddress(address, charCount = 4) {
  // .getAddress here ensures we're dealing with the checksum address
  const a = ethers.utils.getAddress(address);
  return `${a.substring(0, charCount + 2)}...${a.substring(42 - charCount)}`;
}

// Sort BigNumber params `a` and `b` (for use in DataGrid sortComparator)
export function BNSortComparator(a, b) {
  if (!a.sub) {
    return a - b;
  }
  let cmp = a.sub(b);
  if (cmp.isZero()) {
    return 0;
  }
  if (cmp.gt(0)) {
    return 1;
  }
  return -1;
}

// Returns the sha1 of the provided array buffer asa hex string.
export async function makeSha1Hash(buffer) {
  let hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// generate the etherscan URL for a given address, block, tx, or token.
export function etherscanUrl({
  network = "mainnet",
  address,
  block,
  tx,
  token,
  a,
}) {
  const ETHERSCAN_BASE = {
    mainnet: "https://etherscan.io",
    goerli: "https://goerli.etherscan.io",
    prater: "https://goerli.etherscan.io",
  }[network];
  if (address) {
    return `${ETHERSCAN_BASE}/address/${address}`;
  }
  if (block) {
    return `${ETHERSCAN_BASE}/block/${block}`;
  }
  if (tx) {
    return `${ETHERSCAN_BASE}/tx/${tx}`;
  }
  if (token) {
    return `${ETHERSCAN_BASE}/token/${token}${a ? `?a=${a}` : ""}`;
  }
  return ETHERSCAN_BASE;
}

// generate the rocketscan URL for a given node.
export function rocketscanUrl({ network = "mainnet", node }) {
  const ROCKETSCAN_BASE = {
    mainnet: "https://rocketscan.io",
    goerli: "https://prater.rocketscan.io",
    prater: "https://prater.rocketscan.io",
  }[network];
  if (node) {
    return `${ROCKETSCAN_BASE}/node/${node}`;
  }
  return ROCKETSCAN_BASE;
}
