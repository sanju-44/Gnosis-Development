import { createSafeClient } from '@safe-global/sdk-starter-kit'

import { ethers } from 'ethers';
import "dotenv/config";

// update with actual values
const SafeWalletAddress = "0x636E64b1Be4185255d2c2f58b826Aa4eD79A724c" // deployed safe address
const tokenContractAddresss = "0xDE794b03cA86146eB8B895B9ee8f88246C2A7CF8"; // deployed token contract address
const tokenReceiver = "0xAf4DA6B2141f8849FAa0E0f4cB91F104a93aC42e"; // token receiver address
const tokenAmount = "50.0"; // token amount to send

const SIGNER_PRIVATE_KEY = process.env.PUBLIC_ACCOUNT_1_KEY;
const RPC_URL = process.env.RPC_PROVIDER;
const ERC20_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)"
];

async function main() {

    const provider = new ethers.InfuraProvider("sepolia", "60a0a02c909741b598a58bc34b179cbf");

    console.log("provider:::::", provider)
    const wallet = new ethers.Wallet(SIGNER_PRIVATE_KEY, provider); // Ensure this is a private key, not a public address.

    const erc20Contract = new ethers.Contract(tokenContractAddresss, ERC20_ABI, wallet);

    const transferAmount = ethers.parseUnits(tokenAmount, 18);
    const encodedData = erc20Contract.interface.encodeFunctionData("transfer", [tokenReceiver, transferAmount]);
    const safeClient = await createSafeClient(
        {
            provider: RPC_URL,  // only complete url of RPC provider
            signer: SIGNER_PRIVATE_KEY,
            safeAddress: SafeWalletAddress
        }
    )

    console.log("safeClient.isDeployed:::::", await safeClient.isDeployed());
    console.log("safeClient.balanceOf:::::", Number(await erc20Contract.balanceOf(tokenContractAddresss)/BigInt(10**18)));
    // to send token from deployed token contract
    const safeTransactionData = {
        to: tokenContractAddresss,
        data: encodedData,
        value: '0',
        // operation: 0 // 0 for call, 1 for delegate call
    }

    // console.log("safeTransaction:::::", safeTransactionData.operation)
    // // // to send native coin --> here for sepolia eth
    // // const amount = ethers.parseUnits('0.001', 'ether').toString()
    // // const safeTransactionData = {
    // //     to: tokenReceiver,
    // //     data: '0',
    // //     value: amount
    // // }

    const txResult = await safeClient.send({ transactions: [safeTransactionData] })

    const safeTxHashh = txResult.transactions?.safeTxHash
    
    console.log("safeTransaction:::::", safeTxHashh)
}

// main();

console.log(ethers)


