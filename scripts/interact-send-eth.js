require("dotenv").config();
const { ethers } = require("hardhat");

// Step 1: Provide the GnosisSafe contract address (deployed earlier)
const gnosisSafeAddress = "0x32467b43BFa67273FC7dDda0999Ee9A12F2AaA08"; // Replace with actual address everytime you deploy

async function main() {
    const owner1 = process.env.ACCOUNT_1; // Owner1 Address
    const recipient = process.env.ACCOUNT_3; // Address where you want to send ETH
    const ethAmount = ethers.utils.parseEther("0.01"); // Amount of ETH to send

    // Step 2: Get the GnosisSafe contract instance
    const GnosisSafe = await ethers.getContractAt("GnosisSafe", gnosisSafeAddress);
    console.log("Interacting with deployed GnosisSafe at:", gnosisSafeAddress);

    // Construct the transaction to send ETH to the recipient
    const tx = {
        to: recipient,       // The recipient of the ETH
        value: ethAmount,    // The amount of ETH to send (in Wei)
        data: "0x",          // No data since it's a simple ETH transfer
        operation: 0         // 0 = CALL (execute the transaction)
    };

    // Get the signer for owner1
    const owner1Signer = ethers.provider.getSigner(owner1);

    // Generate transaction hash for the Gnosis Safe
    const txHash = await GnosisSafe.getTransactionHash(
        tx.to,
        tx.value,
        tx.data,
        tx.operation,
        0, // SafeTxGas (you can adjust the gas)
        0, // BaseGas
        0, // GasPrice
        ethers.constants.AddressZero, // GasToken
        ethers.constants.AddressZero, // RefundReceiver
        await GnosisSafe.nonce() // Nonce of the transaction
    );
    console.log("GnosisSafe.nonce()::::::", await GnosisSafe.nonce())

    // Sign the transaction hash
    const owner1Signature = await owner1Signer.signMessage(ethers.utils.arrayify(txHash));

    // Execute the transaction
    const executeTx = await GnosisSafe.execTransaction(
        tx.to,
        tx.value,
        tx.data,
        tx.operation,
        0, // SafeTxGas
        0, // BaseGas
        0, // GasPrice
        ethers.constants.AddressZero, // GasToken
        ethers.constants.AddressZero, // RefundReceiver
        owner1Signature // Signature from owner1
    );

    console.log("executeTx:", executeTx);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
