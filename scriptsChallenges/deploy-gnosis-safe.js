require('dotenv').config();
const { ethers } = require('ethers');

// Define Gnosis Safe contract ABI (Minimal ABI)
const masterCopyABI = [
  'function setup(address[] calldata _owners, uint256 _threshold, address to, bytes calldata data, address fallbackHandler, address paymentToken, uint256 payment, address payable paymentReceiver)'
];
const proxyFactoryABI = [
  'event ProxyCreation(address proxy)',
  'function createProxy(address masterCopy, bytes memory initializer) public returns (address proxy)'
];

const safeMasterCopyAddress = process.env.SAFE_MASTER_COPY_ADDRESS; // same for both localhost and mainnet ethereum
const safeProxyFactoryAddress = process.env.SAFE_PROXY_FACTORY_ADDRESS;
const owner1 = process.env.ACCOUNT_1;
const owner2 = process.env.ACCOUNT_2;

// Connect to a JSON RPC provider
const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner(process.env.owner1);

// Contract addresses
const masterCopyAddress = safeMasterCopyAddress; // Gnosis Safe Master Copy address
const proxyFactoryAddress = safeProxyFactoryAddress; // Gnosis Safe Proxy Factory address

async function createGnosisSafe() {
  // Owners of the Safe and threshold
  const owners = [owner1, owner2];
  const threshold = 2;

  // Connect to Master Copy and Proxy Factory contracts
  const masterCopyContract = new ethers.Contract(masterCopyAddress, masterCopyABI, signer);
  const proxyFactoryContract = new ethers.Contract(proxyFactoryAddress, proxyFactoryABI, signer);

  // Create the initializer data for Gnosis Safe
  const initializer = masterCopyContract.interface.encodeFunctionData('setup', [
    owners,
    threshold,
    ethers.constants.AddressZero, // No module
    '0x', // No initialization data
    ethers.constants.AddressZero, // Fallback handler
    ethers.constants.AddressZero, // Payment token
    0, // Payment amount
    ethers.constants.AddressZero // Payment receiver
  ]);

  // Create the proxy safe via the Proxy Factory
  const tx = await proxyFactoryContract.createProxy(masterCopyAddress, initializer);
  const receipt = await tx.wait();

  // Look for the `ProxyCreation` event in the logs
  const event = receipt.events.find(e => e.event === 'ProxyCreation');
  
  if (event) {
    const proxyAddress = event.args.proxy;
    console.log('Safe deployed at:', proxyAddress);
  } else {
    console.log('ProxyCreation event not found in transaction receipt');
  }
}

createGnosisSafe().catch((error) => {
  console.error(error);
});
