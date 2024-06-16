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

describe ("Stake general operation", function(){
  let Tickets, CustomToken, Stake;
  let ticketsOwner, minter, ticketsHolder, CustomTokenOwner, CustomTokenHolder, stakeOwner, user1, user2;

  beforeEach(async ()=>{
    [ticketsOwner, minter, ticketsHolder, CustomTokenOwner, CustomTokenHolder, stakeOwner, user1, user2] = await ethers.getSigners();
    CustomToken = await ethers.getContractFactory("CustomTokenLocal");
    CustomTokenInstance = await CustomToken.connect(CustomTokenOwner).deploy('CustomToken Gov', 'CustomToken', "3000000000", 18);
    Tickets = await ethers.getContractFactory("TicketStake");
    ticketsInstance = await Tickets.connect(ticketsOwner).deploy();
    Stake = await ethers.getContractFactory("CustomTokenStake");
    stakeInstance = await upgrades.deployProxy(Stake,[ticketsInstance.address, CustomTokenInstance.address]);

    await CustomTokenInstance.connect(CustomTokenOwner).transfer(user1.address, "200000")
    await CustomTokenInstance.connect(CustomTokenOwner).transfer(user2.address, "200000")
    await CustomTokenInstance.connect(CustomTokenOwner).transfer(ticketsOwner.address, "200000")
    await ticketsInstance.connect(ticketsOwner)
      .newStakeTicket(stakeInstance.address, 1, 1, 1, 1, false)
    await ticketsInstance.connect(ticketsOwner)
      .newStakeTicket(stakeInstance.address, 150, 1, 6, 100, false)
  })

  it("Should create new Stake", async function(){
    expect(await ticketsInstance.balanceOf(stakeInstance.address, 1)).to.be.equal(150);
    await CustomTokenInstance.connect(user1).approve(stakeInstance.address, "1000000");
    await expect(
      stakeInstance.connect(user1).userStake("1", 5)
    ).to.changeTokenBalance(
      CustomTokenInstance,
      user1.address,
      -500
    );
    expect(await stakeInstance.userSlot.call(user1.address, user1.address, 1)).to.be.equal(5)
    expect((await stakeInstance.stakeBalance.call(user1.address, user1.address, 1, 0)).amount).to.be.equal(100)
    expect(await ticketsInstance.balanceOf(user1.address, 1)).to.be.equal(5);
    expect(await stakeInstance.getUserStake(user1.address, 1)).to.not.be.empty;
  })

  it("Should release Stake", async function(){
    expect(await ticketsInstance.balanceOf(stakeInstance.address, 1)).to.be.equal(150);
    await CustomTokenInstance.connect(user1).approve(stakeInstance.address, "1000000");
    await stakeInstance.connect(user1).userStake("1", 5);

    await CustomTokenInstance.connect(ticketsOwner).approve(stakeInstance.address, "200")
    await stakeInstance.connect(ticketsOwner).includeAPY("1","200")
    expect((await stakeInstance.aprBalance.call(user1.address, 1))).to.be.equal(200)

    await sleep(10);
   
    await ticketsInstance.connect(user1).setApprovalForAll(stakeInstance.address, true);
    await expect(
      stakeInstance.connect(user1).releaseUserStake(1)
    ).to.changeTokenBalance(
      CustomTokenInstance,
      user1.address,
      530
    );
    expect((await stakeInstance.aprBalance.call(user1.address, 1))).to.be.equal(170)
  })

  it("Should return error if user doesn't have balance associated", async function(){
    expect(await ticketsInstance.balanceOf(stakeInstance.address, 1)).to.be.equal(150);
    await CustomTokenInstance.connect(user1).approve(stakeInstance.address, "1000000");
    await stakeInstance.connect(user1).userStake("1", 5);

    await ticketsInstance.connect(user1).setApprovalForAll(stakeInstance.address, true);
    await expectRevert(
     stakeInstance.connect(user1).releaseUserStake(2),
     "CustomTokenStake::Method_releaseUserStake::User doesn't has asociated amount in this slot"
    )
  })

  it("Should return Allowance error Stake", async function(){
    await expectRevert(stakeInstance.connect(ticketsOwner).includeAPY("1","200000"), "ERC20: insufficient allowance")
  })

  it("Should release Stake and return extra APR to owner", async function(){
    expect(await ticketsInstance.balanceOf(stakeInstance.address, 1)).to.be.equal(150);
    await CustomTokenInstance.connect(user1).approve(stakeInstance.address, "1000000");
    await CustomTokenInstance.connect(user2).approve(stakeInstance.address, "1000000");
    await stakeInstance.connect(user1).userStake("1", 5);
    await stakeInstance.connect(user2).userStake("1", 5);

    await CustomTokenInstance.connect(ticketsOwner).approve(stakeInstance.address, "60")
    await stakeInstance.connect(ticketsOwner).includeAPY("1","60")

    await sleep(10);
   
    await ticketsInstance.connect(user1).setApprovalForAll(stakeInstance.address, true);
    await expect(
      stakeInstance.connect(user1).releaseUserStake(1)
    ).to.changeTokenBalance(
      CustomTokenInstance,
      user1.address,
      530
    );

    await expect( 
      stakeInstance.connect(ticketsOwner).returnAPYToOwner("1")
    ).to.changeTokenBalance(
      CustomTokenInstance,
      ticketsOwner.address,
      30
    )
  })

  it("Should fail if Stake exceeds user balance", async function(){
    await expectRevert(stakeInstance.connect(minter).userStake("1", 5), errorMsg.exceedsBalance)
  })

  it("Should fail if Time is not finished", async function(){ 
    await ticketsInstance.connect(ticketsOwner)
      .newStakeTicket(stakeInstance.address, 150, 1000, 6, 100, false)

    await CustomTokenInstance.connect(user1).approve(stakeInstance.address, "1000000");
    await stakeInstance.connect(user1).userStake("2", 5);
    await ticketsInstance.connect(user1).setApprovalForAll(stakeInstance.address, true);
    expect(await ticketsInstance.balanceOf(user1.address, 2)).to.be.equal(5);
    await expectRevert(stakeInstance.connect(user1).releaseUserStake(2), errorMsg.youMustWait)
  })

  it("Should do a new Stake", async function(){
    expect(await ticketsInstance.balanceOf(stakeInstance.address, 1)).to.be.equal(150);
    await CustomTokenInstance.connect(user1).approve(stakeInstance.address, "1000000");
    await stakeInstance.connect(user1).userStake("1", 5);
    await stakeInstance.connect(user1).userStake("1", 5);

    expect(await ticketsInstance.balanceOf(user1.address, 1)).to.be.equal(10);
  })

  it("Should release all stakes by slot", async function(){
    expect(await ticketsInstance.balanceOf(stakeInstance.address, 1)).to.be.equal(150);
    await CustomTokenInstance.connect(user1).approve(stakeInstance.address, "1000000");
    await stakeInstance.connect(user1).userStake("1", 5);
    await stakeInstance.connect(user1).userStake("1", 5);

    await CustomTokenInstance.connect(ticketsOwner).approve(stakeInstance.address, "200000")
    await stakeInstance.connect(ticketsOwner).includeAPY("1","200000")

    await sleep(10);
   
    await ticketsInstance.connect(user1).setApprovalForAll(stakeInstance.address, true);
    await expect(
      stakeInstance.connect(user1).releaseUserStake(1)
    ).to.changeTokenBalance(
      CustomTokenInstance,
      user1.address,
      1060
    );

    expect(await ticketsInstance.balanceOf(user1.address, 1)).to.be.equal(0);
  })

})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}