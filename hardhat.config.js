require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-solhint");
require('solidity-coverage');
require('hardhat-gas-reporter');
require("hardhat-tracer");
const { opScript } = require("./operation_scripts/JS");
const { secrets } = require('.');

task("stakeOps", "Stake operation for admin")
  .addParam("script", "mint, burn, all")
  .addOptionalParam("holder", "the account that will receive the tickets")
  .addOptionalParam("amount", "the amount of tickes to generate")
  .addOptionalParam("time", "the amount of time in epoch")
  .addOptionalParam("yield", "yild asociated to ticket")
  .addOptionalParam("cost", "cost of each ticket")
  .addOptionalParam("neednft", "bool param to st if it's need an SR NFT")
  .addOptionalParam("ticketid", "ticket ID")
  .setAction(async(args)=>{
    switch(args.script){
      case "createNewStakeSlot":
        try{
          const dir = await opScript.createNewStakeSlot(
            args.holder,
            args.amount,
            args.time,
            args.yield,
            args.cost,
            args.neednft);
          console.log("\x1b[32m", "INFO::Ticket Created. Stored on: "+dir)
        } catch (err){
          console.log ("\x1b[31m", err)
        }
        break;
      case "userStake":
        try{
          const dir = await opScript.userStake(args.ticketid, args.amount);
          console.log("\x1b[32m", "INFO::Stake done. Stored on: "+dir)
        } catch (err){
          console.log ("\x1b[31m", err)
        }
        break;
      case "includeAPY":
        try{
          const dir = await opScript.includeAPY(args.ticketid, args.amount);
          console.log("\x1b[32m", "INFO::APY included. Stored on: "+dir)
        } catch (err){
          console.log ("\x1b[31m", err)
        }
        break;
      case "getUserStake":
          try{
            const dir = await opScript.getUserStake(args.address);
            console.log("\x1b[32m", "INFO::Events Obtained. Stored on: "+dir)
          } catch (err){
            console.log ("\x1b[31m", err)
          }
          break;
      case "balanceOf":
          try{
            const balance = await opScript.balanceOf(args.holder, args.ticketid);
            console.log("\x1b[32m", "INFO::User Balance for ticket ID "+args.ticketid+" :"+balance)
          } catch (err){
            console.log ("\x1b[31m", err)
          }
          break;
    }
    
  })

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    enabled: secrets.REPORT_GAS,
    currency: "BNB",
    coinmarketcap: secrets.COINMKT_API_KEY
  },
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      accounts: secrets.ACCOUNTS,
      plugins: ["hardhat-network-tracer", "hardhat-gas-reporter", "solidity-coverage"]
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${secrets.INFURA_API_KEY}`,
      chainId: 11155111,
      accounts: secrets.ACCOUNTS
    },
    bscTest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: secrets.ACCOUNTS_TEST
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts: secrets.ACCOUNTS_MAIN
    }
  }
};
