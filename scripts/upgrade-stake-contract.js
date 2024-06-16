const { ethers, upgrades } = require("hardhat");
require("@nomiclabs/hardhat-etherscan");

const UPGRADEABLE_PROXY = "";
// const UPGRADEABLE_PROXY = "";

async function main() {
   const gas = await ethers.provider.getGasPrice()
   const CustomTokenStake = await ethers.getContractFactory("CustomTokenStake");
   console.log("Upgrading CustomTokenStake Contract...");
   let upgrade = await upgrades.upgradeProxy(UPGRADEABLE_PROXY, SRP, {
      gasPrice: gas
   });
   console.log("CustomTokenStake Upgraded");
   console.log("CustomTokentake Contract Deployed To:", upgrade.address)
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
 });