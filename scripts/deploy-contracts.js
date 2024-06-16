const { ethers, upgrades } = require("hardhat");
const { constants, methods } = require("./utils");


async function main() {
  const [deployer, firstTicketsOwner] = await ethers.getSigners();
  
  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  CustomToken = await methods.getCustomTokenAddress();

  const CustomTokenStake = await ethers.getContractFactory("CustomTokenStake");
  const Tickets = await ethers.getContractFactory("TicketStake");
  const ticketsContract = await Tickets.deploy();
  console.log ("Tickets Contract deployed to: "+ ticketsContract.address)
  const token = await upgrades.deployProxy(CustomTokenStake, [
    ticketsContract.address, 
    CustomToken
  ]);

  console.log("CustomToken Stake Contract deployed to:", token.address);
  
}

main();
