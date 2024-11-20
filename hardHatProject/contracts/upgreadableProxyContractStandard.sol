// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// Import OpenZeppelin Libraries
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/StorageSlot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UpgradeableProxy
 * @dev This contract delegates all calls to an implementation contract. The implementation can be upgraded by the owner.
 */
abstract contract UpgradeableProxy {
    // Define the EIP-1967 implementation slot: bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    // Event emitted when the implementation is upgraded
    event Upgraded(address indexed newImplementation);

    /**
     * @dev Constructor sets the initial implementation and transfers ownership to the deployer.
     * @param _initialImplementation Address of the initial implementation contract.
     */
    constructor(address _initialImplementation) {
        // Store the implementation address in the EIP-1967 slot
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = _initialImplementation;
        emit Upgraded(_initialImplementation);
    }

    /**
     * @dev Upgrades the implementation contract to a new address.
     * Can only be called by the contract owner.
     * @param _newImplementation Address of the new implementation contract.
     */
    function upgradeLogic(address _newImplementation) external {
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = _newImplementation;
        emit Upgraded(_newImplementation);
    }

    /**
     * @dev Returns the current implementation address.
     * @return impl Address of the current implementation contract.
     */
    function getLogicContractAddress() external view returns (address impl) {
        impl = StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }

    /**
     * @dev Fallback function that delegates calls to the implementation.
     * Will run if no other function in the contract matches the call data.
     */
    fallback() external payable {
        _delegate(StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value);
    }

    /**
     * @dev Receive function that delegates calls to the implementation.
     * Will run if call data is empty.
     */
    receive() external payable {
        _delegate(StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value);
    }

    /**
     * @dev Delegates the current call to `implementation`.
     * This function does not return to its internal call site. It will return directly to the external caller.
     * @param implementation Address of the implementation contract.
     */
    function _delegate(address implementation) internal {
        require(implementation != address(0), "Proxy: Implementation address not set");

        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Delegatecall to the implementation contract
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data
            returndatacopy(0, 0, returndatasize())

            // Handle result
            switch result
            case 0 {
                // Delegatecall failed, revert with the returned data
                revert(0, returndatasize())
            }
            default {
                // Delegatecall succeeded, return the data
                return(0, returndatasize())
            }
        }
    }
}

