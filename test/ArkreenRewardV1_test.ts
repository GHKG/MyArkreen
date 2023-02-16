import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
const {ethers, upgrades} =  require("hardhat");
import { providers, utils, BigNumber, Signer, Wallet} from 'ethers'
import hre from 'hardhat'
import { ecsign, fromRpcSig, ecrecover } from 'ethereumjs-util'
import {getPermitDigest, getWithdrawDigest, ZERO_ADDRESS} from './utils/myUtils'

// console.log(upgrades)



import {
    ArkreenRewardV1,
    ArkreenRewardV1__factory,

    ArkreenTokenV1,
    ArkreenTokenV1__factory,

    ArkreenRewardV2,
    ArkreenRewardV2__factory,


} from "../typechain";
import { deploy } from "@openzeppelin/hardhat-upgrades/dist/utils";


describe("Test ArkreenReward Contract ", () => {

    async function deployFixture() {
        const [deployer, foundation, user2] = await ethers.getSigners();

        const ArkreenTokenV1Factory = await ethers.getContractFactory("ArkreenTokenV1");
        const AKREToken:ArkreenTokenV1= await upgrades.deployProxy(ArkreenTokenV1Factory, [10_000_000_000, foundation.address], {initializer: 'initialize', kind: 'uups'});
        await AKREToken.deployed();
            
        const ArkreenRewardV1Factory = await ethers.getContractFactory("ArkreenRewardV1")
        const arkreenRewardV1:ArkreenRewardV1 = await upgrades.deployProxy(ArkreenRewardV1Factory,[AKREToken.address, foundation.address], {initializer: 'initialize', kind: 'uups'})
        await arkreenRewardV1.deployed()
            
        let totalsupply = await AKREToken.totalSupply();
        // console.log(totalsupply)
        // console.log(await AKREToken.balanceOf(foundation.address))
        await AKREToken.connect(foundation).transfer(arkreenRewardV1.address, 10000*10**8)
        // console.log(await AKREToken.balanceOf(arkreenRewardV1.address))
        
        //await AKREToken.connect(deployer).setFoundationAddress(foundation.address)
        // await AKREToken.connect(foundation).transfer(ArkreenRewardUpgradeable.address, expandTo18Decimals(10000))

        //already set in initialize function
        //await ArkreenRewardUpgradeable.connect(deployer).setERC20ContractAddress(AKREToken2.address)
        // await ArkreenRewardUpgradeable.connect(deployer).setValidationAddress(foundation.address)

        // console.log(await arkreenRewardV1.connect(deployer).ERC20Contract())
        return {AKREToken, arkreenRewardV1, deployer, foundation, user2}


    }

    describe('init test', ()=>{
        it("all argument should be set correctly", async ()=>{
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            expect(await arkreenRewardV1.connect(deployer).validationAddress()).to.be.equal(foundation.address)
            expect(await arkreenRewardV1.connect(deployer).ERC20Contract()).to.be.equal(AKREToken.address)
        })

        it('function initialize() could be execute only onec',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 

            await expect(arkreenRewardV1.initialize(AKREToken.address, user2.address)).to.be.revertedWith("Initializable: contract is already initialized")
        })
    })

    describe("withdraw test", ()=>{

        it("foundation sign & user withdraw", async ()=>{
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 

            const foundation_key = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const digest = getWithdrawDigest(
                user2.address,
                ethers.BigNumber.from(100*10**8),
                ethers.BigNumber.from(0),
                arkreenRewardV1.address,
                'Arkreen Reward',
                '1'
              )

              const {v,r,s} = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(foundation_key.slice(2), 'hex'))

              expect(await arkreenRewardV1.connect(user2).withdraw(
                user2.address, 
                ethers.BigNumber.from(100*10**8), 
                ethers.BigNumber.from(0), 
                v,r,s)).to.be.ok

              expect(await arkreenRewardV1.connect(deployer).nonces(user2.address)).to.be.equal(1)
              expect(await AKREToken.balanceOf(user2.address)).to.be.equal(100*10**8)
              expect(await AKREToken.balanceOf(arkreenRewardV1.address)).to.be.equal((10000-100)*10**8)           
        
        })

        it("receiver error should be reverted", async ()=>{
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 

            const foundation_key = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const digest = getWithdrawDigest(
                user2.address,
                ethers.BigNumber.from(100*10**8),
                ethers.BigNumber.from(0),
                arkreenRewardV1.address,
                'Arkreen Reward',
                '1'
              )

              const {v,r,s} = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(foundation_key.slice(2), 'hex'))

              await expect( arkreenRewardV1.connect(deployer).withdraw(
                user2.address, 
                ethers.BigNumber.from(100*10**8), 
                ethers.BigNumber.from(0), 
                v,r,s)).to.be.revertedWith('only receiver can withdraw token')        
  
        })
        
        it("nonce error should be reverted", async ()=>{
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 

            const foundation_key = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const digest = getWithdrawDigest(
                user2.address,
                ethers.BigNumber.from(100*10**8),
                ethers.BigNumber.from(0),
                arkreenRewardV1.address,
                'Arkreen Reward',
                '1'
              )

              const {v,r,s} = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(foundation_key.slice(2), 'hex'))

              await expect( arkreenRewardV1.connect(user2).withdraw(
                user2.address, 
                ethers.BigNumber.from(100*10**8), 
                ethers.BigNumber.from(99), 
                v,r,s)).to.be.revertedWith('nonce does not macth')        
  
        })

        it("sig error should be reverted", async ()=>{
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 

            const foundation_key = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const digest = getWithdrawDigest(
                user2.address,
                ethers.BigNumber.from(100*10**8),
                ethers.BigNumber.from(0),
                arkreenRewardV1.address,
                'Arkreen Reward',
                '2'//set version "2",call for error
              )

              const {v,r,s} = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(foundation_key.slice(2), 'hex'))

              await expect( arkreenRewardV1.connect(user2).withdraw(
                user2.address, 
                ethers.BigNumber.from(100*10**8), 
                ethers.BigNumber.from(0), 
                v,r,s)).to.be.revertedWith('signer doesn\'t not match or singature error')        
        })

        it("when paused , user can not withdraw", async ()=>{
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 

            await arkreenRewardV1.connect(deployer).pause()//set pause

            const foundation_key = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const digest = getWithdrawDigest(
                user2.address,
                ethers.BigNumber.from(100*10**8),
                ethers.BigNumber.from(0),
                arkreenRewardV1.address,
                'Arkreen Reward',
                '1'
              )

              const {v,r,s} = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(foundation_key.slice(2), 'hex'))

              await expect(arkreenRewardV1.connect(user2).withdraw(
                user2.address, 
                ethers.BigNumber.from(100*10**8), 
                ethers.BigNumber.from(0), 
                v,r,s)).to.be.rejectedWith('Pausable: paused')   
        
                
        })

    })

    describe("ownerable test" , ()=>{

        it('only owner could call pause',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            await expect(arkreenRewardV1.connect(user2).pause()).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('only owner could call unpause',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            await arkreenRewardV1.connect(deployer).pause()
            await expect(arkreenRewardV1.connect(user2).unpause()).to.be.revertedWith('Ownable: caller is not the owner')

        })

        it('only owner could call setERC20ContractAddress',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            await expect(arkreenRewardV1.connect(user2).setERC20ContractAddress(arkreenRewardV1.address)).to.be.revertedWith('Ownable: caller is not the owner')
            
        })

        it('only owner could call setValidationAddress',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            await expect(arkreenRewardV1.connect(user2).setValidationAddress(user2.address)).to.be.revertedWith('Ownable: caller is not the owner')
            
        })

        it('only owner can transfer ownership',async () => {
            const {arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture)

            expect(await arkreenRewardV1.owner()).to.be.equal(deployer.address)
            await arkreenRewardV1.transferOwnership(foundation.address)
            expect(await arkreenRewardV1.owner()).to.be.equal(foundation.address)
            await expect(arkreenRewardV1.transferOwnership(user2.address)).to.be.revertedWith("Ownable: caller is not the owner")
            await arkreenRewardV1.connect(foundation).transferOwnership(user2.address)
            expect(await arkreenRewardV1.owner()).to.be.equal(user2.address)
        })

        it('transfer ownership to address 0 is not allowed',async () => {
            const {arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture)
            await expect(arkreenRewardV1.transferOwnership(ZERO_ADDRESS)).to.be.revertedWith("Ownable: new owner is the zero address")
        })

    })

    describe('set functions test',async () => {
        
        it('use setERC20ContractAddress func set ERC20 address',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            expect(await arkreenRewardV1.connect(deployer).setERC20ContractAddress(arkreenRewardV1.address)).to.be.ok
            expect(await arkreenRewardV1.connect(deployer).ERC20Contract()).to.be.equal(arkreenRewardV1.address)
        })

        it('setERC20ContractAddress: only contract address could be set to ERC20 address',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            await expect(arkreenRewardV1.connect(deployer).setERC20ContractAddress(user2.address)).to.be.revertedWith('is not a contract address')
        })

        it('setERC20ContractAddress: 0 address is forbidden',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            await expect(arkreenRewardV1.connect(deployer).setERC20ContractAddress(ZERO_ADDRESS)).to.be.revertedWith('zero address is not allowed')
        })

        it('use setValidationAddress func set validator address',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            expect(await arkreenRewardV1.connect(deployer).setValidationAddress(user2.address)).to.be.ok
            expect(await arkreenRewardV1.connect(deployer).validationAddress()).to.be.equal(user2.address)
        })

        it('setValidationAddress: 0 address is forbidden',async () => {
            const {AKREToken, arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture) 
            expect(await arkreenRewardV1.connect(deployer).setValidationAddress(user2.address)).to.be.ok
            expect(await arkreenRewardV1.connect(deployer).validationAddress()).to.be.equal(user2.address)
        })

    })

    describe("upgrade test", ()=>{
        it("contract owner should be deployer", async () =>{
            const {arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture)

            expect(await arkreenRewardV1.connect(deployer).owner()).to.be.equal(deployer.address)
        })

        it("upgrade and call function, use method 1", async ()=>{
            const {arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture)

            let ArkreenRewardV2Factory = await ethers.getContractFactory("ArkreenRewardV2")
            let arkreenRewardV2 = await upgrades.upgradeProxy(arkreenRewardV1.address, ArkreenRewardV2Factory)
            // console.log("after upgrade")
            // console.log("ArkreenTokenV2 address is " + arkreenTokenV2.address)
            expect(arkreenRewardV2.address).to.be.equal(arkreenRewardV1.address)

            // console.log(await upgrades.erc1967.getImplementationAddress(arkreenTokenV2.address)," getImplementationAddress")
            // console.log(await upgrades.erc1967.getAdminAddress(arkreenTokenV2.address)," getAdminAddress")    

            //expect(await ArkreenTokenUpgradeable2.connect(deployer).nonces(receiver.address)).to.be.equal(0)
            expect(await arkreenRewardV2.connect(deployer).hehe()).to.be.equal('hehehehe')
        })

        it("upgrade , use method 2", async ()=>{
            const {arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture)

            // console.log("AKRETokenUpgradeable address is " + arkreenTokenV1.address)
            // console.log("deployer address is " + deployer.address)

            // console.log(await upgrades.erc1967.getImplementationAddress(arkreenTokenV1.address)," getImplementationAddress")
            // console.log(await upgrades.erc1967.getAdminAddress(arkreenTokenV1.address)," getAdminAddress")  
            

            let ArkreenRewardV2Factory = await ethers.getContractFactory("ArkreenRewardV2")
            let AKRERewardV2 = await ArkreenRewardV2Factory.deploy()
            await AKRERewardV2.deployed()
            // console.log()
            // console.log("new ArkreenTokenV2 impl address is " + AKRETokenV2.address)

            const ArkreenRewardV1Factory = ArkreenRewardV1__factory.connect(arkreenRewardV1.address, deployer);
            // let calldata = arkreenTokenV1.interface.encodeFunctionData("nonces", [deployer.address])
            // const updateTx = await arkreenTokenV1.upgradeToAndCall(AKRETokenV2.address, calldata)
            const updateTx = await arkreenRewardV1.upgradeTo(AKRERewardV2.address)
            await updateTx.wait()

            // console.log(await upgrades.erc1967.getImplementationAddress(arkreenTokenV1.address)," getImplementationAddress")
            // console.log(await upgrades.erc1967.getAdminAddress(arkreenTokenV1.address)," getAdminAddress") 

            expect(await upgrades.erc1967.getImplementationAddress(arkreenRewardV1.address)).to.be.equal(AKRERewardV2.address)
            
            const ARewardV2Factory = ArkreenRewardV2__factory.connect(arkreenRewardV1.address, deployer);
            const arkreenRewardV2 = ARewardV2Factory.attach(arkreenRewardV1.address)  
            expect(await arkreenRewardV2.connect(deployer).hehe()).to.be.equal('hehehehe')
        })

        it('only owner could do upgrade',async () => {
            const {arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture)

            let ArkreenRewardV2Factory = await ethers.getContractFactory("ArkreenRewardV2")
            let AKRERewardV2 = await ArkreenRewardV2Factory.deploy()
            await AKRERewardV2.deployed()
            
            await expect(arkreenRewardV1.connect(user2).upgradeTo(AKRERewardV2.address)).to.be.revertedWith('Ownable: caller is not the owner')
        })


    })

    describe('event test',async () => {

        it("withdraw should emit event",async () => {
            const {arkreenRewardV1, deployer, foundation, user2} = await loadFixture(deployFixture)

            const foundation_key = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            const digest = getWithdrawDigest(
                user2.address,
                ethers.BigNumber.from(100*10**8),
                ethers.BigNumber.from(0),
                arkreenRewardV1.address,
                'Arkreen Reward',
                '1'
              )

              const {v,r,s} = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(foundation_key.slice(2), 'hex'))

              await expect(arkreenRewardV1.connect(user2).withdraw(
                user2.address, 
                ethers.BigNumber.from(100*10**8), 
                ethers.BigNumber.from(0), 
                v,r,s))
                .to.emit(arkreenRewardV1, 'UserWithdraw')
                .withArgs(user2.address, ethers.BigNumber.from(100*10**8), ethers.BigNumber.from(0))

            // await expect(arkreenNotary.saveData("aaa", "b", 99, 100, 100))
            // .to.emit(arkreenNotary, "DataSaved")
            // .withArgs("aaa", "b", 99, 100, 100);
        })

    })

    
})