const { time, loadFixture, } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

require('dotenv').config();

describe("ERC20 Token", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function initialDeployment() {
        const [ owner, address2, address3 ] = await ethers.getSigners();
        
        const Implementation1 = await ethers.getContractFactory("contracts/ImplementationERC20v1.sol:LogicERC20v1");
        const ERC20Implementation = await Implementation1.deploy();
        const ERC20ImplementationAddress = await ERC20Implementation.getAddress();
        
        
        const proxy = await ethers.getContractFactory("contracts/UpgradeableERC20Proxy1.sol:UpgradeableProxy");
        const ERC20Proxy = await proxy.deploy(ERC20ImplementationAddress, owner.address);   
        const ERC20ProxyAddress = await ERC20Proxy.getAddress();

        const ERC20ProxyWithProxyi = await ethers.getContractAt("contracts/UpgradeableERC20Proxy1.sol:IUpgradeableProxy", ERC20ProxyAddress);
        const ERC20ProxyWithProxyI = ERC20ProxyWithProxyi.attach(ERC20ProxyAddress);

        const ERC20ProxyWithImpi = await ethers.getContractAt("contracts/ImplementationERC20v1.sol:ILogicERC20v1", ERC20ProxyAddress);
        const ERC20ProxyWithImpI = ERC20ProxyWithImpi.attach(ERC20ProxyAddress);

        return { owner, address2, address3, ERC20ProxyWithProxyI, ERC20ProxyWithImpI, ERC20ImplementationAddress }; // use these exact name under describe function
    }
    

    describe("Proxy Contract", function () {
        it("check admin address is right", async function () {
            const { owner, address2, address3, ERC20ProxyWithProxyI, ERC20ProxyWithImpI, ERC20ImplementationAddress } = await loadFixture(initialDeployment);
            expect(await ERC20ProxyWithProxyI.getAdmin()).to.equal(owner.address);
            expect(await ERC20ProxyWithProxyI.connect(address2).getAdmin()).to.equal(owner.address);
        });

        it("check logic address is right ", async function() {
            const { address2, ERC20ProxyWithProxyI, ERC20ImplementationAddress } = await loadFixture(initialDeployment);
            expect(await ERC20ProxyWithProxyI.getImplementation()).to.equal(ERC20ImplementationAddress);
            expect(await ERC20ProxyWithProxyI.connect(address2).getImplementation()).to.equal(ERC20ImplementationAddress);
        })
    
        it("check changeLogic contract as admin and notAdmin", async function () {
            const { owner, address2, address3, ERC20ProxyWithProxyI, ERC20ProxyWithImpI, ERC20ImplementationAddress } = await loadFixture(initialDeployment);

            // new logic contract for check change logic
            const Implementation1 = await ethers.getContractFactory("contracts/ImplementationERC20v1.sol:LogicERC20v1");
            const ERC20Implementation = await Implementation1.deploy();
            const ERC20ImplementationAddress1 = await ERC20Implementation.getAddress();

            // check whether the new logic contract address is not the same as the first logic contract
            expect(ERC20ImplementationAddress).to.not.equal(ERC20ImplementationAddress1);

            // trying to change logic contract as admin user
            const changeLogicAsAdmin = await ERC20ProxyWithProxyI.changeLogic(ERC20ImplementationAddress1);
            await expect(changeLogicAsAdmin).not.to.reverted;
            await expect(changeLogicAsAdmin).to.emit(ERC20ProxyWithProxyI, "Upgraded").withArgs(ERC20ImplementationAddress1);

            // trying to change logic as notAdmin
            await expect(ERC20ProxyWithProxyI.connect(address2).changeLogic(ERC20ImplementationAddress1)).to.be.revertedWith("Only Admin can access this function");
        });

        it("check changeAdmin with admin and notAdmin", async function() {
            const { owner, address2, address3, ERC20ProxyWithProxyI, ERC20ProxyWithImpI, ERC20ImplementationAddress } = await loadFixture(initialDeployment);

            // trying to change admin as admin user
            const checkk = await ERC20ProxyWithProxyI.changeAdmin(address2.address);
            await expect(checkk).to.emit(ERC20ProxyWithProxyI, "AdminChanged").withArgs(owner.address, address2.address);
            await expect(checkk).not.to.be.reverted;
            expect(await ERC20ProxyWithProxyI.getAdmin()).to.equal(address2.address);

            // trying to change admin as notAdmin
            await expect(ERC20ProxyWithProxyI.connect(address3).changeAdmin(address3.address)).to.be.revertedWith("Only Admin can access this function")
        })
    });
 
    describe("Logic contract", function() {
        const tokenName = "Real Token";
        const tokenSymbol = "RT";
        const tokenTotalSupply = 1000;
        it("initialize function the ERC20 contract", async function(){
            const { owner, address2, address3, ERC20ProxyWithProxyI, ERC20ProxyWithImpI, ERC20ImplementationAddress } = await loadFixture(initialDeployment);

            const mintAddress = owner.address;
            const ERC20Initialize = await ERC20ProxyWithImpI.initialize(tokenName, tokenSymbol, tokenTotalSupply, mintAddress);
            await expect(ERC20Initialize).not.to.be.reverted;// check whether the initialize function is called
            await expect(ERC20Initialize).to.emit(ERC20ProxyWithImpI, "Initialized").withArgs(1);// check whether this function emits an event "Initialized"
            const zeroAddress = ethers.ZeroAddress;
            await expect(ERC20Initialize).to.emit(ERC20ProxyWithImpI, "Transfer").withArgs(zeroAddress, mintAddress, tokenTotalSupply) // check whether the function emits an event "Transfer"

            expect(await ERC20ProxyWithImpI.name()).to.equal(tokenName)
            expect(await ERC20ProxyWithImpI.symbol()).to.equal(tokenSymbol)
            expect(await ERC20ProxyWithImpI.totalSupply()).to.equal(tokenTotalSupply)
            // expect(await ERC20ProxyWithImpI.balanceOf(mintAddress)).that.equal(tokenTotalSupply)
        })
    })
})

// interface ILogicERC20v1 {
//     // Events
//     event tokenReissued(address indexed from, address indexed to);
//     event setAccountStatus(address indexed account, bool value);

//     // inherited Events
//     event Transfer(address indexed from, address indexed to, uint256 value); // from ERC20Upgradeable
//     event Initialized(uint64 version); // from Initializable
    
//     // initialize ERC20 contract 
//     function initialize(string memory name_, string memory symbol_, uint256 initialSupply) external; 

//     // View Functions
//     function name() external view returns (string memory);
//     function symbol() external view returns (string memory);
//     function decimals() external view returns (uint8);
//     function totalSupply() external view returns (uint256);
//     function balanceOf(address account) external view returns (uint256);
//     function allowance(address owner, address spender) external view returns (uint256);

//     // State-Changing Functions
//     function transfer(address to, uint256 value) external returns (bool);
//     function approve(address spender, uint256 value) external returns (bool);
//     function transferFrom(address from, address to, uint256 value) external returns (bool);

//     // Administrative Functions
//     function mint(address to, uint256 amount) external;
//     function burn(address account, uint256 value) external;

//     function freezeAccount(address account) external;
//     function unfreezeAccount(address account) external;

//     function reissueTokens(address from, address to) external;

//     function lockTokens() external;
//     function unlockTokens() external;
// }