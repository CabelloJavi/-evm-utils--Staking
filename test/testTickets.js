require("@nomicfoundation/hardhat-chai-matchers");
require('@openzeppelin/hardhat-upgrades');
const {expectRevert} = require('@openzeppelin/test-helpers');

const { expect } = require("chai");
const { ethers } = require('hardhat');

const { constants, errorMsg } = require("./helpers");
const {
  defaultValue,
  addressZero
} = constants;

describe ("Tickets general operation", function(){
  let Tickets;
  let ticketsOwner, minter, ticketsHolder;

  beforeEach(async ()=>{
    [ticketsOwner, minter, ticketsHolder] = await ethers.getSigners();
    Tickets = await ethers.getContractFactory("TicketStake");
    ticketsInstance = await Tickets.connect(ticketsOwner).deploy();
    await ticketsInstance.connect(ticketsOwner)
      .newStakeTicket(ticketsHolder.address, 100, 15638400, 6, 500, false)
  })

  it ("Should have balance in token Holder", async function () {
    expect(await ticketsInstance.balanceOf(ticketsHolder.address, 0)).to.be.equal(100)
  })

  it ("Should mint new Staking configuration", async function () {
    expect (await ticketsInstance.connect(ticketsOwner)
      .newStakeTicket(ticketsHolder.address, 150, 15638400, 6, 700, false))
    expect(await ticketsInstance.balanceOf(ticketsHolder.address, 1)).to.be.equal(150)
  })

  it ("Should return Stake configuration", async function () {
    structStake = await ticketsInstance.getStakeConfiguration(0);
    expect (structStake.deltaTime).to.be.equal(15638400);
    expect (structStake.yield).to.be.equal(6);
    expect (structStake.CustomTokenCost).to.be.equal(500);
    expect (structStake.needAnSRNFT).to.be.equal(false);
  })

  it ("Should fail if user is not contract owner", async function() {
    await expectRevert (ticketsInstance.connect(minter)
      .newStakeTicket(ticketsHolder.address, 150, 15638400, 6, 700, false), errorMsg.ownership)
  })

  it ("Should return uri", async function(){
    expect (await ticketsInstance.uri(1)).to.be.equal("<IMAGE-URL>1.json")
  })
})