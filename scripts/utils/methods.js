const { constants } = require(".");
const hre = require("hardhat");

async function getNetworkName() {
    const chainId = hre.network.config.chainId;
    return chainId
}

async function getProvider() {
  const chainId = await getNetworkName();
  return ((chainId == 56) ? constants.MAINNET_PROVIDER : ((chainId==97) ? constants.TESTNET_PROVIDER : constants.LOCALHOST_PROVIDER))
}

async function getCustomTokenAddress() {
    const chainId = await getNetworkName();
    console.log("CHAINID: "+chainId)
    if (chainId != 56 && chainId != 97){
        console.log("You're not on Mainnet or testnet. Deploying Mock CustomToken")
        const CustomToken = await ethers.getContractFactory("CustomTokenLocal");
        const CustomTokenContract = await CustomToken.deploy('CustomTokenGovernance', 'CustomToken', "1000000000000000000000000000", 18);
        console.log("CustomToken Token deployed to: "+CustomTokenContract.address);
        CustomToken = CustomTokenContract.address;
      } else {
        CustomToken = (chainId == 56) ? constants.CustomToken_MAINNET : constants.CustomToken_TESTNET;
        console.log("You're on mainnet or testnet. Registering CustomToken Contract Address: ", CustomToken)
      }
    return CustomToken;
}

module.exports = {getNetworkName, getProvider, getCustomTokenAddress}