// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketStake is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct StakeConfig {
        uint256 deltaTime;
        uint8 yield;
        uint256 CustomTokenCost;
        bool needAnSRNFT;
    }

    mapping (uint256 => StakeConfig) private stake;

    constructor() ERC1155("<URL>") {}

    function newStakeTicket(
        address _ticketsHolder,
        uint256 _amount, 
        uint256 _deltaTime, 
        uint8 _yield,
        uint256 _CustomTokenCost,
        bool _needAnSRNFT
    ) public onlyOwner{
        stake[_tokenIds.current()].deltaTime    = _deltaTime;
        stake[_tokenIds.current()].yield        = _yield;
        stake[_tokenIds.current()].CustomTokenCost      = _CustomTokenCost;
        stake[_tokenIds.current()].needAnSRNFT  = _needAnSRNFT;
        _mint(_ticketsHolder, _tokenIds.current(), _amount, "");
        _tokenIds.increment();
    }

    function uri(uint256 _tokenid) override public pure returns (string memory) {
        return string(
            abi.encodePacked(
                "<IMAGE-URL>",
                Strings.toString(_tokenid),".json"
            )
        );
    }  

    function getStakeConfiguration(uint256 _tokenid) public view returns (StakeConfig memory) {
        return stake[_tokenid];
    }
}
