import RocketStorageK from "./generated/contracts/RocketStorage.json";
import RocketRewardsPoolK from "./generated/contracts/RocketRewardsPool.json";
import RocketMerkleDistributorMainnetK from "./generated/contracts/RocketMerkleDistributorMainnet.json";

const contracts = {
  RocketStorage: {
    address: "0x1d8f8f00cfa6758d7bE78336684788Fb0ee0Fa46",
    abi: RocketStorageK.abi,
  },
  RocketRewardsPool: {
    address: "0x594Fb75D3dc2DFa0150Ad03F99F97817747dd4E1",
    abi: RocketRewardsPoolK.abi,
  },
  RocketMerkleDistributorMainnet: {
    address: "0x7eccbbd05830edf593d30005b8f69e965af4d59f",
    abi: RocketMerkleDistributorMainnetK.abi,
  },
};

// TODO: consider pulling addresses from on-chain like this:
// storage = RocketStorage("0x1d8f8f00cfa6758d7bE78336684788Fb0ee0Fa46")
// upgrades = storage.getAddress(keccak256("rocketDAONodeTrustedUpgrade"))
// for each ContractAdded event in upgrades:
//   kAddress = event.newAddress
//   kName = storage.getString(ethers.utils.solidityKeccak256(
//     ["string", "string"],
//     ["contract.name", kAddress]
//   ))
//   kAbi = storage.getString(ethers.utils.solidityKeccak256(
//     ["string", "string"],
//     ["contract.abi", kName]
//   ))
//   contracts[kName] = { address: kAddress, abi: kAbi }

export default contracts;
