// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// Interface for the Implementation contract
interface IImplementation {
    function greet() external pure returns (string memory);
    function add(uint256 a, uint256 b) external pure returns (uint256);
    function subtract(uint256 a, uint256 b) external pure returns (uint256);
}

// Proxy contract
contract UpgradeableProxy {
    address public implementation;
    address public owner;

    constructor(address _implementation) {
        implementation = _implementation;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function upgradeTo(address newImplementation) public onlyOwner {
        implementation = newImplementation;
    }

    // function greet() public view returns (string memory) {
    //     // Use the interface to call the greet function on the Implementation contract
    //     return IImplementation(implementation).greet();
    // }

    // Receive function to accept Ether
    receive() external payable {}

    fallback() external payable {
        (bool success, bytes memory returndata) = implementation.delegatecall(msg.data);
        assembly {
            let size := returndatasize()
            returndatacopy(0, 0, size)
            if iszero(success) {
                revert(returndata, size)
            }
            return(0, size)
        }
    }
}

// Implementation contract
contract Implementation {
    function greet() public pure returns (string memory) {
        return "Hello, world!";
    }

    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }

    function subtract(uint256 a, uint256 b) public pure returns (uint256) {
        return a - b;
    }
}


