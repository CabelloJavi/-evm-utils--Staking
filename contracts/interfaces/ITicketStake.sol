pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ITicketStake is IERC1155 {
    struct StakeConfig {
        uint256 deltaTime;
        uint8 yield;
        uint256 CustomTokenCost;
        bool needAnSRNFT;
    }

    function getStakeConfiguration(uint256 _tokenid) external view returns (StakeConfig memory);
}