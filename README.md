# Basic Operation

## Contracts ABI

The production ABIs has been included in this repo to help to integration. You can find on:

`./artifacts/contracts/<CONTRACT_NAME>.sol/<CONTRACT_NAME>.json`

## Architecture of Solution

![Architecture](./img/Staking_Architecture.png)

## Operation Flow

![Flow](./img/StakeFlow.png)

### Ticket Creation

Contract `Ticket Stake` is based on ERC1155. So, tickets can be created on batch with different IDs and differents configuration. The basic configuration to metadata json file is:

```
{
    "attributes": [
        {
          "trait_type": "Time",
          "value": "6M"
        },
        {
          "trait_type": "Yield",
          "value": "6"
        },
        {
          "trait_type": "CustomTokenCost",
          "value": "500"
        },
        {
          "trait_type": "NFTNeeded",
          "value": "false"
        }
    ],
    "name": "Stake-ID1",
    "description": "CustomToken Staking IDXX",
}
```
This is the same information that must be included when the ticket will be created. In this contract we will create the tickets:
```
npx hardhat stakeOps --script createNewStakeSlot --holder "0xDF2A6d25678d37d6f6aFbaC91023efEE1cEc602e" --amount 10 --time 1669906948 --yield "6" --cost 100 --neednft false
```

Parameters:

- **holder**: Account where will be minted the amount of tokens.
- **amount**: Amount of tokens that will be minted
- **time**: Default time for staking by ticket
- **yield**: Yield for staking config ticket
- **cost**: cost of single ticket
- **neednft**: Flag to set if buyer need Starter Pack to have the whole yield.

### User Stake

When a user wants to stake, he'll buy an amount of tickets related to the total amount of stake that he wants to make. I.E. If a ticket cost is 100CustomToken and the amount the user wants to stake is 1000CustomToken, he'll buy 10 tickets.

```
npx hardhat stakeOps --script userStake --ticketid XX --amount X
```
> Previously, user needs to give approve to CustomToken Stake Contract to manipulate the amount of CustomToken: 
> 
> `CustomToken.methods.approve(<CustomToken_Stake_Contract>, <total_amount_of_CustomToken>)`
 
### Include APY

Every slot of staking needs an amount to be included by admin. I.E. If the amount allocated to an slot is 10000CustomToken, the amount allocated to APY that must be included is 600CustomToken. So, when the time for user ends, they'll withdraw their amounts + the proportional amount of the total APY included. This is done invoking the method `includeAPY`

```
npx hardhat stakeOps --script includeAPY --ticketid XX --amount X
```

### release user Stake

User only can withdraw its amount when time is ended. If not, they'll receive this message error from contract:

```
CustomTokenStake::Method_releaseUserStake::Time's not ended
```
To claim user Stake:

```
npx hardhat stakeOps --script releaseStake --ticketid XX
```

### returnAPYToOwner

This method returns the excess of APY to owner:

```
npx hardhat stakeOps --script returnAPYToOwner --ticketid XX
```

## FRONTEND Snippets

### Create new Stake

```
const pullTransaction = async () => {
    const web3 = new Web3(window.ethereum);
    const CustomContract = new web3.eth.Contract(
      TicketStaking as any,
      "CONTRACT_ADDRESS"
    );
    const dataTransact = await CustomContract.methods.newStakeTicket(holder, amount, time, yield, cost, neednft).encodeABI();

    const res = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: auth.activeAccount,
          to: ""CONTRACT_ADDRESS"",
          data: dataTransact,
          gas: "300000",
        },
      ],
    });
  };
```

### User Stake

```
const pullTransaction = async () => {
    const web3 = new Web3(window.ethereum);
    const CustomContract = new web3.eth.Contract(
      StakingContract as any,
      "CONTRACT_ADDRESS"
    );
    const dataTransact = await CustomContract.methods.userStake(ticketid, amount).encodeABI();

    const res = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: auth.activeAccount,
          to: ""CONTRACT_ADDRESS"",
          data: dataTransact,
          gas: "300000",
        },
      ],
    });
  };
```

### Release User Stake

```
const pullTransaction = async () => {
    const web3 = new Web3(window.ethereum);
    const CustomContract = new web3.eth.Contract(
      StakingContract as any,
      "CONTRACT_ADDRESS"
    );
    const dataTransact = await CustomContract.methods.releaseUserStake(ticketid).encodeABI();

    const res = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: auth.activeAccount,
          to: ""CONTRACT_ADDRESS"",
          data: dataTransact,
          gas: "300000",
        },
      ],
    });
  };
```

### Include APY

```
const pullTransaction = async () => {
    const web3 = new Web3(window.ethereum);
    const CustomContract = new web3.eth.Contract(
      StakingContract as any,
      "CONTRACT_ADDRESS"
    );
    const dataTransact = await CustomContract.methods.includeAPY(ticketid, amount).encodeABI();

    const res = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: auth.activeAccount,
          to: ""CONTRACT_ADDRESS"",
          data: dataTransact,
          gas: "300000",
        },
      ],
    });
  };
```

## TROUBLESHOOTING

### Reverts returned by contract

#### CustomTokenStake::Method_userStake::Staking costs exceeds user balance

This revert message will be shown when user tries to buy a Ticket, but he has not enough funds

#### CustomTokenStake::Method_releaseUserStake::User doesn't has asociated amount in this slot

This revert message will be shown when user tries to withdraw funds and he has not funds asociated to this Ticket ID

#### CustomTokenStake::Method_releaseUserStake::Time's not ended

This revert message will be shown when user tries to withdraw funds and time for staking has not ended

#### ERC20: insufficient allowance

This revert message will be shown when user tries to buy a ticket, but approve is not enough for CustomToken Staking Contract