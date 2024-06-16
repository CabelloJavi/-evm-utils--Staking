// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./interfaces/ITicketStake.sol";
import "./interfaces/IERC20.sol";

contract CustomTokenStake is ERC1155HolderUpgradeable, ContextUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    // using SafeERC20 for IERC20;
    
    ITicketStake private stakeTickets;
    IERC20 private CustomToken;

    struct Stake{
        uint256 amount;
        uint256 withdraw_ts;
    }

    struct StakeConfig {
        uint256 deltaTime;
        uint8 yield;
        uint256 CustomTokenCost;
        bool needAnSRNFT;
    }
    StakeConfig internal StakeRequired;

    mapping (address => mapping (uint256 => mapping(uint256 => Stake))) public stakeBalance;
    mapping (address => mapping (uint256 => uint256)) public userSlot; // Counts the number of stakes of the user
    mapping (uint256 => uint256) public aprBalance;

    function initialize(
        address ticketContractAddress,
        address CustomTokenContractAddress
    ) public initializer {
        __Ownable_init();
        stakeTickets = ITicketStake(ticketContractAddress);
        CustomToken = IERC20(CustomTokenContractAddress);
    }

    function userStake(uint8 _ticketID, uint8 _amountOfTickets) public {
        for (uint i=0 ; i<_amountOfTickets; i++)
        {
            StakeRequired = StakeConfig(
                {
                    deltaTime: stakeTickets.getStakeConfiguration(_ticketID).deltaTime,
                    yield: stakeTickets.getStakeConfiguration(_ticketID).yield,
                    CustomTokenCost: stakeTickets.getStakeConfiguration(_ticketID).CustomTokenCost,
                    needAnSRNFT: stakeTickets.getStakeConfiguration(_ticketID).needAnSRNFT
                }
            );

            require (CustomToken.balanceOf(_msgSender()) >= StakeRequired.CustomTokenCost, "CustomTokenStake::Method_userStake::Staking costs exceeds user balance");
            
            uint256 slot = userSlot[_msgSender()][_ticketID]; 
            CustomToken.transferFrom(_msgSender(), address(this), StakeRequired.CustomTokenCost);
            stakeBalance[_msgSender()][_ticketID][slot].amount = StakeRequired.CustomTokenCost;
            stakeBalance[_msgSender()][_ticketID][slot].withdraw_ts = block.timestamp + StakeRequired.deltaTime;

            stakeTickets.safeTransferFrom(address(this), _msgSender(), _ticketID, 1, "");

            userSlot[_msgSender()][_ticketID] += 1;
        }
    }

    function releaseUserStake(uint256 _ticketID) public {
        uint256 balance = stakeTickets.balanceOf(_msgSender(), _ticketID);
        require (balance > 0, "CustomTokenStake::Method_releaseUserStake::User doesn't has asociated amount in this slot");
        for (uint256 slot = 0; slot < balance; slot++)
        {
            StakeRequired = StakeConfig(
                {
                    deltaTime: stakeTickets.getStakeConfiguration(_ticketID).deltaTime,
                    yield: stakeTickets.getStakeConfiguration(_ticketID).yield,
                    CustomTokenCost: stakeTickets.getStakeConfiguration(_ticketID).CustomTokenCost,
                    needAnSRNFT: stakeTickets.getStakeConfiguration(_ticketID).needAnSRNFT
                }
            );

            require (withdrawAvailable(_ticketID, slot), "CustomTokenStake::Method_releaseUserStake::Time's not ended");
            stakeBalance[_msgSender()][_ticketID][slot].amount = 0;
            stakeBalance[_msgSender()][_ticketID][slot].withdraw_ts = 0;
            uint256 aprCalc = StakeRequired.CustomTokenCost * StakeRequired.yield / 100;
            CustomToken.transfer(_msgSender(), StakeRequired.CustomTokenCost + aprCalc);
            aprBalance[_ticketID] -= aprCalc;
            stakeTickets.safeTransferFrom(_msgSender(), address(this), _ticketID, 1, "");

            userSlot[_msgSender()][_ticketID] -= 1; //Test Overflow
        }
    }

    function withdrawAvailable(uint256 _ticketID, uint256 slot) internal view returns(bool){
        return stakeBalance[_msgSender()][_ticketID][slot].withdraw_ts <= block.timestamp;
    }

    function getUserStake(address account, uint8 _ticketID) public view returns (Stake[] memory){
        Stake[] memory slots = new Stake[](userSlot[account][_ticketID]);
        for (uint8 i=0; i<slots.length; i++){
            slots[i] = stakeBalance[account][_ticketID][i];
        }
        return slots;
    }

    function includeAPY(uint8 _ticketID, uint256 _amount) public onlyOwner {
        CustomToken.transferFrom(_msgSender(), address(this), _amount);
        aprBalance[_ticketID]+=_amount;
    }

    function returnAPYToOwner(uint8 _ticketID) public onlyOwner {
        CustomToken.transfer(_msgSender(), aprBalance[_ticketID]);
        aprBalance[_ticketID]=0;
    }

}
