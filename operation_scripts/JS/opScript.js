const { ethers, providers } = require('ethers');
const { config } = require("./config");
const abi = require(config.STAKE_ABI_PATH);
const { instantiateContract } = require("./modules/contractABI");

async function importArtifacts(){
    const signer = new ethers.Wallet(
        config.PK,
        providers.getDefaultProvider(config.RPC_TEST)
     );
    
    const contractStake = await instantiateContract(config.STAKE_CONTRACT_ADDRESS, config.STAKE_ABI_PATH, signer)
    const contractTicket = await instantiateContract(config.TICKET_STAKE_CONTRACT_ADDRESS, config.TICKET_STAKE_ABI_PATH, signer)
    return {contractStake, contractTicket, signer};
}

async function createNewStakeSlot(ticketsHolder, amount, deltaTime, yield, cost, needAnSRNFT){
    const { contractStake, contractTicket , signer } = await importArtifacts();

    console.log(ticketsHolder)

    const data = await contractTicket.populateTransaction.newStakeTicket(
        ticketsHolder,
        amount,
        deltaTime,
        yield,
        cost,
        needAnSRNFT,
        {
            gasLimit: ethers.utils.hexlify(2500000)
        })

    return (await signer.sendTransaction(data))
}

async function userStake(ticketID, amount){
    const { contractStake, contractTicket , signer } = await importArtifacts();

    const data = await contractStake.populateTransaction.userStake(
        ticketID, 
        amount,
        {
            gasLimit: ethers.utils.hexlify(2500000)
        })

    return (await signer.sendTransaction(data))
}

async function includeAPY(ticketID, amount){
    const { contractStake, contractTicket , signer } = await importArtifacts();

    const data = await contractStake.populateTransaction.includeAPY(
        ticketID, 
        amount,
        {
            gasLimit: ethers.utils.hexlify(2500000)
        })

    return (await signer.sendTransaction(data))
}

async function getUserStake(address, ticketID){
    const { contractStake, contractTicket , signer } = await importArtifacts();

    const data = await contractStake.populateTransaction.getUserStake(address, ticketID)

    return (await signer.sendTransaction(data))
}

async function balanceOf(address, ticketid){
    const { contractStake, contractTicket , signer } = await importArtifacts();

    const data = await contractTicket.functions.balanceOf(address, ticketid)

    return (data)
}

module.exports = {createNewStakeSlot, userStake, includeAPY, getUserStake, balanceOf}