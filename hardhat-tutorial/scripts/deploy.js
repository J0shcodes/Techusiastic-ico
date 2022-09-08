const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { TECHUSIASTIC_NFT_CONTRACT_ADDRESS } = require("../constants");
const hre = require("hardhat");

async function main() {
  const techusiasticNFTContract = TECHUSIASTIC_NFT_CONTRACT_ADDRESS;

  const techusiasticTokenContract = await ethers.getContractFactory(
    "TechusiasticToken"
  );

  const deployedTechusiasticTokenContract =
    await techusiasticTokenContract.deploy(techusiasticNFTContract);

  console.log(
    "Techusaistic Token Contract Address:",
    deployedTechusiasticTokenContract.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
