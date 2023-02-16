import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
const {ethers, upgrades} =  require("hardhat");
// import hre from 'hardhat'
import { ZERO_ADDRESS} from './utils/myUtils'


import {
    ArkreenNotaryU,
    ArkreenNotaryU__factory,
    ArkreenNotaryU2,
    ArkreenNotaryU2__factory
} from "../typechain";

describe("test ArkreenNotary", ()=>{

    async function deployFixture() {
        const [deployer, user1, user2] = await ethers.getSigners();

        let ArkreenNotaryUFactory = await ethers.getContractFactory("ArkreenNotaryU");
        const arkreenNotary:ArkreenNotaryU= await upgrades.deployProxy(ArkreenNotaryUFactory, [], {initializer: 'initialize', kind: 'uups'});
        await arkreenNotary.deployed();

        return {arkreenNotary,deployer, user1, user2}
        
    }

    describe("save data test", ()=>{

        it("user can not save data except the owner", async function () {
    
            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)
    
            expect(await arkreenNotary.owner()).to.be.equal(deployer.address)
            await expect(arkreenNotary.connect(user1).saveData("aaa", "bbb", 100, 100, 100)).to.be.revertedWith("Ownable: caller is not the owner")
    
        });
    
        it("save data", async function () {
    
            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)
    
            expect(await arkreenNotary.connect(deployer).saveData("aaa", "bbb", 0, 1, 2)).to.be.ok
    
            expect(await arkreenNotary.blockHash()).to.be.equal("aaa")
            expect(await arkreenNotary.cid()).to.be.equal("bbb")
            expect(await arkreenNotary.blockHeight()).to.be.equal(0)
            expect(await arkreenNotary.totalPowerGeneraton()).to.be.equal(1)
            expect(await arkreenNotary.circulatingSupply()).to.be.equal(2)
    
        });

        it("blockheight, totalPowerGeneraton, circulatingSupply should be increased", async function(){

            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)
    
            expect(await arkreenNotary.connect(deployer).saveData("aaa", "bbb", 100, 100, 100)).to.be.ok
    
            await expect(arkreenNotary.connect(deployer).saveData("aaa", "b", 99, 100, 100)).to.be.revertedWith("blockHeight data must increase!")
            await expect(arkreenNotary.connect(deployer).saveData("aaa", "b", 100, 99, 100)).to.be.revertedWith("totalPowerGeneraton data must increase!")
            await expect(arkreenNotary.connect(deployer).saveData("aaa", "b", 100, 100, 99)).to.be.revertedWith("circulatingSupply data must increase!")
        })
    })


    describe("ownerable test", ()=>{

        it("deployer should be owner", async function () {

            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)
    
            expect(await arkreenNotary.owner()).to.be.equal(deployer.address)
    
        });
    

        it('only owner can transfer ownership',async () => {
            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)

            expect(await arkreenNotary.owner()).to.be.equal(deployer.address)
            await arkreenNotary.transferOwnership(user1.address)
            expect(await arkreenNotary.owner()).to.be.equal(user1.address)
            await expect(arkreenNotary.transferOwnership(user2.address)).to.be.revertedWith("Ownable: caller is not the owner")
            await arkreenNotary.connect(user1).transferOwnership(user2.address)
            expect(await arkreenNotary.owner()).to.be.equal(user2.address)
        })

        it('transfer ownership to address 0 is not allowed',async () => {
            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)
            await expect(arkreenNotary.transferOwnership(ZERO_ADDRESS)).to.be.revertedWith("Ownable: new owner is the zero address")
        })
    })

    describe('event test',async () => {

        it("saveData should emit event",async () => {
            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)

            await expect(arkreenNotary.saveData("aaa", "b", 99, 100, 100))
            .to.emit(arkreenNotary, "DataSaved")
            .withArgs("aaa", "b", 99, 100, 100);
        })

    })

    describe('upgrade test',async () => {
        

        it('only owner could do upgrade',async () => {
            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)

            let ArkreenNotaryU2Factory = await ethers.getContractFactory("ArkreenNotaryU2")
            let arkreenNotaryU2 = await ArkreenNotaryU2Factory.deploy()
            await arkreenNotaryU2.deployed()
            
            await expect(arkreenNotary.connect(user2).upgradeTo(arkreenNotaryU2.address)).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('upgrade to new empl',async () => {
            const {arkreenNotary, deployer, user1, user2} = await loadFixture(deployFixture)

            let ArkreenNotaryU2Factory = await ethers.getContractFactory("ArkreenNotaryU2")
            let arkreenNotaryU2 = await ArkreenNotaryU2Factory.deploy()
            await arkreenNotaryU2.deployed()
            
            const updateTx = await arkreenNotary.upgradeTo(arkreenNotaryU2.address)
            await updateTx.wait()

            expect(await upgrades.erc1967.getImplementationAddress(arkreenNotary.address)).to.be.equal(arkreenNotaryU2.address)
            
            const aNotaryU2Factory = ArkreenNotaryU2__factory.connect(arkreenNotary.address, deployer);
            const aNotaryU2 = aNotaryU2Factory.attach(arkreenNotary.address)  
            await expect(aNotaryU2.saveData("aaa", "b", 99, 100, 100, 99))
                .to.emit(aNotaryU2, "DataSaved2")
                .withArgs("aaa", "b", 99, 100, 100, 99);

        })
    })



})