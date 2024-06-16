const {ethers} = require('ethers');

async function getContractABI(path){
    contractObject = require(path);
    return contractObject.abi 
}

async function instantiateContract(address, abiPath, signer){
    abi = await getContractABI(abiPath);
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}

module.exports = {instantiateContract}