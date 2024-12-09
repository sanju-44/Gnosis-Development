// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "@openzeppelin/contracts/utils/StorageSlot.sol";

interface ILogicERC20v1 {
    // Events
    event tokenReissued(address indexed from, address indexed to);
    event setAccountStatus(address indexed account, bool value);

    // inherited Events
    event Transfer(address indexed from, address indexed to, uint256 value); // from ERC20Upgradeable
    event Initialized(uint64 version); // from Initializable
    
    // initialize ERC20 contract
    function initialize(string memory name_, string memory symbol_, uint256 initialSupply, address _owner) external;

    // View Functions
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    // State-Changing Functions
    function transfer(address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);

    // Administrative Functions
    function mint(address to, uint256 amount) external;
    function burn(address account, uint256 value) external;

    function freezeAccount(address account) external;
    function unfreezeAccount(address account) external;

    function reissueTokens(address from, address to) external;

    function lockTokens() external;
    function unlockTokens() external;
}

contract UnChangeableERC20Logic {
    bytes32 private constant IMPLEMENTATION_SLOT = bytes32(uint(keccak256("eip1967.proxy.implementation")) - 1);
    bytes32 private constant ADMIN_SLOT = bytes32(uint(keccak256("eip1967.proxy.admin")) - 1);

    bool internal tokensLocked;

    mapping(address => bool) FreezedAccount;

    event tokenReissued(address indexed from, address indexed to);
    event setAccountStatus(address indexed account, bool value);

    modifier ifAdmin() {
        if (msg.sender == _getAdmin()) {
            _;
        } else {
            revert("Only Admin can access this function");
        }
    }

    modifier ifUnFrozenAccount(address account) {
        if (FreezedAccount[account] == false) {
            _;
        } else {
            revert("cannot transfer from frozen account");
        }
    }

    modifier ifNotLocked {
        if (!tokensLocked) {
            _;
        } else {
            revert("Tokens are locked");
        }
    }

    function _getAdmin() private view returns (address) {
        return StorageSlot.getAddressSlot(ADMIN_SLOT).value;
    }
}

contract LogicERC20v1 is Initializable, ERC20Upgradeable, UnChangeableERC20Logic {
    function initialize(string memory name_, string memory symbol_, uint256 initialSupply, address _owner) external initializer ifAdmin {
        __ERC20_init(name_, symbol_); // ERC20 initialization
        _mint(_owner, initialSupply);
    }

    function name() public view override returns (string memory) {
        return super.name();
    }

    function symbol() public view override returns (string memory) {
        return super.symbol();
    }

    function decimals() public view override returns (uint8) {
        return super.decimals();
    }

    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return super.allowance(owner, spender);
    }

    // from doc https://ixittech-my.sharepoint.com/:w:/g/personal/jo_sharon_ionixxtech_com/EXGESbpEe_9fP49OJxCjpgYBDzFzJNPKfzKA5tEQgeCt0g?e=ysnR8P
    // mint(): Creates new tokens during the crowdfunding phase.   
    function mint(address to, uint256 amount) external ifAdmin {
        _mint(to, amount);
    }

    // burn(): Removes tokens if ownership is given up or transferred back.
    function burn(address account, uint256 value) external ifAdmin {
        _burn(account, value);
    }

    // transfer(): Allows tokens to be transferred between investors.  
    function transfer(address to, uint256 value) public override ifUnFrozenAccount(msg.sender) ifNotLocked returns (bool) {
        return super.transfer(to, value);
    }

    // balanceOf(): Checks the number of tokens held by an investor.  
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

    // freezeAccount(): Freezes tokens in special cases, like lost access or regulatory issues. 
    function freezeAccount(address account_) external ifAdmin{
        require(!FreezedAccount[account_], "This wallet is already frozen");
        FreezedAccount[account_] = true;
        emit setAccountStatus(account_, true);
    }

    // unfreezeAccount(): Unfreezes tokens once the issue is resolved.  
    function unfreezeAccount(address account_) external ifAdmin{
        require(FreezedAccount[account_], "This wallet is already unfrozen");
        FreezedAccount[account_] = false;
        emit setAccountStatus(account_, false);
    }

    // reissueTokens(): Issues new tokens to a new wallet if the original wallet is compromised. 
    function reissueTokens(address from, address to) external ifAdmin{
        uint256 bal = balanceOf(from);
        _burn(from, bal);
        _mint(to, bal);
        emit tokenReissued(from, to);
    }

    // approve(): Allows someone else to use tokens on behalf of the owner.  
    function approve(address spender, uint256 value) public override ifNotLocked returns (bool) {
        return super.approve(spender, value);
    }

    // transferFrom(): Facilitates token transfer on behalf of the owner.  
    function transferFrom(address from, address to, uint256 value) public override ifNotLocked returns (bool) {
        return super.transferFrom(from, to, value);
    }

    // lockTokens(): Locks tokens until specific conditions are met.  
    function lockTokens() external ifAdmin{
        require(!tokensLocked, "Tokens are already locked");
        tokensLocked = true;
    }

    // unlockTokens(): Unlocks tokens once conditions are fulfilled. 
    function unlockTokens() external ifAdmin{
        require(tokensLocked, "Tokens are already unlocked");
        tokensLocked = false;
    }
}

