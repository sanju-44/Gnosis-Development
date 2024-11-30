// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;


import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


interface IERC20Proxy {
    function upgradeLogic(address _newImplementation) external;
    function getLogicContractAddress() external view returns(address);
}


/**
 * @title UpgradeableProxy
 * @dev This contract forwards all calls to the implementation contract using delegatecall.
 * The implementation contract can be updated to change the logic in the proxy.
 */
contract ERC20Proxy is Ownable {
    // Storage slot for the address of the current implementation contract
    address internal implementation;

    /**
     * @dev Sets the initial implementation address.
     * @param _implementation The address of the initial implementation contract.
     */
    constructor(address _implementation) Ownable(msg.sender) {
        require(_implementation != address(0), "Implementation address cannot be zero");
        implementation = _implementation;
    }

    /**
     * @dev Updates the implementation address, allowing the proxy to be upgraded.
     * @param _newImplementation The address of the new implementation contract.
     */
    function upgradeLogic(address _newImplementation) external onlyOwner{
        require(_newImplementation != address(0), "New implementation address cannot be zero");
        implementation = _newImplementation;
    }

    function getLogicContractAddress() external view  returns(address) {
        return implementation;
    }

    /**
     * @dev Fallback function that delegates calls to the implementation contract.
     * It supports any kind of function calls, returning data if there is any.
     */
    fallback() external payable {
        _delegate(implementation);
    }

    /**
     * @dev Function that handles both receiving and forwarding calls to the implementation contract.
     */
    receive() external payable {
        _delegate(implementation);
    }

    /**
     * @dev Performs a delegatecall to the implementation contract.
     * This function forwards all available gas and reverts on errors.
     * @param _impl Address of the implementation contract to delegate the call to.
     */
    function _delegate(address _impl) internal {
        require(_impl != address(0), "Implementation address is not set");

        // Delegate the call to the implementation contract
        assembly {
            // Copy msg.data (input data) into memory
            calldatacopy(0, 0, calldatasize())

            // Call the implementation contract using delegatecall
            let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)

            // Copy the returned data into memory
            returndatacopy(0, 0, returndatasize())

            // If the call succeeded, return the data
            if result {
                return(0, returndatasize())
            }
            // If the call failed, revert with the returned data
            revert(0, returndatasize())
        }
    }
}


interface IERC20Implementation {
    // Events from ERC20
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ERC20 standard functions
    function initialize(string memory _name, string memory _symbol, uint256 _initialSupply) external;

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    // Additional mint and burn functions specific to this implementation
    function mint(address to, uint256 amount) external;

    function burn(address from, uint256 amount) external;

    function owner() external view returns (address);
}


contract ERC20Implementation is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    /**
     * @dev Initializes the token with its name, symbol, and initial supply.
     * @param _name Name of the token.
     * @param _symbol Symbol of the token.
     * @param _initialSupply Initial supply of the token.
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) public initializer {
        __ERC20_init(_name, _symbol); // Initialize the ERC20Upgradeable
        __Ownable_init(msg.sender);            // Initialize OwnableUpgradeable
        _mint(msg.sender, _initialSupply); // Mint initial supply to the deployer
    }

    /**
     * @dev Example function to mint new tokens.
     * @param to Address to receive the minted tokens.
     * @param amount Amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Example function to burn tokens from a specific address.
     * @param from Address from which tokens will be burned.
     * @param amount Amount of tokens to burn.
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}
