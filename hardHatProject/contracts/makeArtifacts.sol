// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

// import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";

// for GnosisSafe 1.3.0
// import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol";
// import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol";

// for GnosisSafe 1.4.1
import "@safe-global/safe-contracts/contracts/proxies/SafeProxy.sol";
import "@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol";
import "@safe-global/safe-contracts/contracts/Safe.sol";

interface IGnosisSafe {

    function setup(
        address[] calldata _owners,
        uint256 _threshold,
        address to,
        bytes calldata data,
        address fallbackHandler,
        address paymentToken,
        uint256 payment,
        address payable paymentReceiver
    ) external;
}