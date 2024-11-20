const { time, loadFixture, } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("***** proxyCheck *****", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function initialDeployment() {
        const [ owner ] = await ethers.getSigners();
        
        const Implementation = await ethers.getContractFactory("contracts/upgreadableProxyContract2.sol:ERC20Implementation");
        const ERC20Implementation = await Implementation.deploy();
        const ERC20ImplementationAddress = await ERC20Implementation.getAddress();
        
        const proxy = await ethers.getContractFactory("contracts/upgreadableProxyContract2.sol:ERC20Proxy");
        const ERC20Proxy = await proxy.deploy(ERC20ImplementationAddress);   
        const ERC20ProxyAddress = await ERC20Proxy.getAddress();

        const ERC20ProxyWithProxyi = await ethers.getContractAt("contracts/upgreadableProxyContract2.sol:IERC20Proxy", ERC20ProxyAddress);
        const ERC20ProxyWithProxyI = ERC20ProxyWithProxyi.attach(ERC20ProxyAddress);

        const ERC20ProxyWithImpi = await ethers.getContractAt("contracts/upgreadableProxyContract2.sol:IERC20Implementation", ERC20ProxyAddress);
        const ERC20ProxyWithImpI = ERC20ProxyWithImpi.attach(ERC20ProxyAddress);

        return { owner, ERC20ProxyWithImpI, ERC20ProxyWithProxyI }; // use th exact name of the contract

        }
    

    describe("initial check", function () {
        const tokenName = "Real Token";
        const tokenSymbol = "RT";
        const tokenTotalSupply = 1000;
        it("initialize check --> mint, tokenName, tokenSymbol, tokenTotalSupply", async function () {
            const { owner, ERC20ProxyWithImpI, ERC20ProxyWithProxyI } = await loadFixture(initialDeployment);
            await ERC20ProxyWithImpI.initialize(tokenName, tokenSymbol, tokenTotalSupply);

            expect(await ERC20ProxyWithImpI.name()).to.equal(tokenName);
            expect(await ERC20ProxyWithImpI.symbol()).to.equal(tokenSymbol);
            expect(await ERC20ProxyWithImpI.totalSupply()).to.equal(tokenTotalSupply);
            expect(await ERC20ProxyWithImpI.owner()).to.equal(await owner.getAddress());
            expect(await ERC20ProxyWithImpI.balanceOf(await owner.getAddress())).to.equal(tokenTotalSupply);

        });
    
        // it("Should set the right owner", async function () {
        //   const { lock, owner } = await loadFixture(deployOneYearLockFixture);
    
        //   expect(await lock.owner()).to.equal(owner.address);
        // });
    
        // it("Should receive and store the funds to lock", async function () {
        //   const { lock, lockedAmount } = await loadFixture(
        //     deployOneYearLockFixture
        //   );
    
        //   expect(await ethers.provider.getBalance(lock.target)).to.equal(
        //     lockedAmount
        //   );
        // });
    });
});