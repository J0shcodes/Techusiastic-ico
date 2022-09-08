// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ITechusiastic.sol";

contract TechusiasticToken is ERC20, Ownable {
   uint256 public constant tokenPrice = 0.001 ether;

   uint256 public constant tokenPerNFT = 10 * 10**18;

   uint256 public constant maxTotalSupply = 10000 * 10**18; 

   ITechusiastic TechusiasticNFT;

   mapping(uint256 => bool) tokenIdsClaimed;

   constructor(address _techusiasticContract) ERC20("Techusiastic Token", "TT") {
    TechusiasticNFT = ITechusiastic(_techusiasticContract);
   }

   function mint(uint256 amount) public payable {
    uint256 _requiredAmount = tokenPrice * amount;
    require(msg.value >= _requiredAmount, "Ether not enough to perform this transaction");
    uint256 amountWithDecimals = amount * 10**18;
    require((totalSupply() + amountWithDecimals) <= maxTotalSupply, "Exceeds the max total supply available.");

    _mint(msg.sender, amountWithDecimals);
   } 

   function claim() public {
    address sender = msg.sender;

    uint256 balance = TechusiasticNFT.balanceOf(sender);

    require(balance > 0, "You don't have any Techusiastic NFT");

    uint256 amount = 0;

    for (uint256 i = 0; i < balance; i++) {
        uint256 tokenId = TechusiasticNFT.tokenOfOwnerByIndex(sender, i);

        if(!tokenIdsClaimed[tokenId]) {
            amount += 1;
            tokenIdsClaimed[tokenId];
        }
    }

    require(amount > 0, "You have claimed all the tokens");

    _mint(msg.sender, amount * tokenPerNFT);
   }

   function withdraw() public onlyOwner {
    address _owner = owner();
    uint256 amount = address(this).balance;
    (bool sent, ) = _owner.call{value: amount}("");
    require(sent, "Failed to sent Ether"); 
   }
   
   receive() external payable {}

   fallback() external payable {}

}