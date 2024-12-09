// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/StorageSlot.sol";

interface IUpgradeableProxy {
    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);

    function changeAdmin(address _newAdmin) external;
    function changeLogic(address _newImplementation) external;
    function getImplementation() external view returns (address);
    function getAdmin() external view returns (address);
}

contract UpgradeableProxy is Proxy {
    constructor(address creatorImplementation_, address proxyAdmin_) {
        assert( IMPLEMENTATION_SLOT == bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1));

        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = creatorImplementation_;
        _setAdmin(proxyAdmin_);
    }

    bytes32 private constant IMPLEMENTATION_SLOT = bytes32(uint(keccak256("eip1967.proxy.implementation")) - 1);
    bytes32 private constant ADMIN_SLOT = bytes32(uint(keccak256("eip1967.proxy.admin")) - 1);

    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);

    modifier ifAdmin() {
        if (msg.sender == _getAdmin()) {
            _;
        } else {
            revert("Only Admin can access this function");
        }
    }

    receive() external payable {}

    function changeAdmin(address _newAdmin) external ifAdmin {
        emit AdminChanged(msg.sender, _newAdmin);
        _setAdmin(_newAdmin);
    }

    function changeLogic(address _newImplementation) external ifAdmin {
        _setImplementation(_newImplementation);
        emit Upgraded(_newImplementation);
    }

    function getAdmin() external view returns (address) {
        return _getAdmin();
    }

    function getImplementation() external view returns (address) {
        return _implementation();
    }

    function _implementation() internal view override returns (address) {
        return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value;
    }

    function _getAdmin() private view returns (address) {
        return StorageSlot.getAddressSlot(ADMIN_SLOT).value;
    }

    function _setAdmin(address admin_) private {
        require(admin_ != address(0), "admin = zero address");
        StorageSlot.getAddressSlot(ADMIN_SLOT).value = admin_;
    }

    function _setImplementation(address implementation_) private {
        require(implementation_.code.length > 0, "implementation is not contract");
        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = implementation_;
    }
}