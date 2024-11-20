// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract ImplementMyToken is ERC20Upgradeable {
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract ProxyMyToken is ERC20, Ownable {
    address public tokenAddress;

    constructor() ERC20("My Token", "MTK") Ownable(msg.sender) {}

    function upDateLogic(address _tokenAddress) external onlyOwner {
        tokenAddress = _tokenAddress;
    }

    // Fallback function to delegate calls to the tokenAddress contract
    fallback() external payable {
        require(tokenAddress != address(0), "Token address not set");
        
        // Prepare the delegate call
        (bool success, bytes memory data) = tokenAddress.delegatecall(msg.data);
        
        // Ensure the delegate call was successful
        require(success, "Delegatecall failed");
        
        // Return the data from the delegate call
        assembly {
            return(add(data, 0x20), mload(data))
        }
    }

    function mint(address to, uint256 amount) public {
        
    }

    // Optional: receive function to accept Ether if needed
    receive() external payable {}
}