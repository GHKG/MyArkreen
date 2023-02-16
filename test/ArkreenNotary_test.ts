import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
const {ethers, upgrades} =  require("hardhat");
import hre from 'hardhat'


import {
    ArkreenNotary,
    ArkreenNotary__factory
} from "../typechain";

describe("test ArkreenNotary", ()=>{

    async function deployFixture() {
        const [deployer, user1,user2] = await ethers.getSigners();

        let ArkreenNotaryFactory = await ethers.getContractFactory("ArkreenNotary");
        const arkreenNotary:ArkreenNotary = await ArkreenNotaryFactory.deploy();
        await arkreenNotary.deployed();

        return {arkreenNotary,deployer, user1, user2}
        
    }

    describe("Functionality test", ()=>{

        it("deployer should be owner", async function () {

            const {arkreenNotary, deployer, user1, user2} = await deployFixture()
    
            expect(await arkreenNotary.owner()).to.be.equal(deployer.address)
    
        });
    
        it("save data test", async function () {
    
            const {arkreenNotary, deployer, user1, user2} = await deployFixture()
    
            // string  public blockHash;
            // string  public cid;
            // uint256 public blockHeight;
            // uint256 public totalPowerGeneraton;
            // uint256 public circulatingSupply;
    
            expect(await arkreenNotary.connect(deployer).saveData("aaa", "bbb", 0, 1, 2)).to.be.ok
    
            expect(await arkreenNotary.blockHash()).to.be.equal("aaa")
            expect(await arkreenNotary.cid()).to.be.equal("bbb")
            expect(await arkreenNotary.blockHeight()).to.be.equal(0)
            expect(await arkreenNotary.totalPowerGeneraton()).to.be.equal(1)
            expect(await arkreenNotary.circulatingSupply()).to.be.equal(2)
    
        });
    })


    describe("reverted test", ()=>{
        
        it("blockheight, totalPowerGeneraton, circulatingSupply should be increased", async function(){

            const {arkreenNotary, deployer, user1, user2} = await deployFixture()
    
            expect(await arkreenNotary.connect(deployer).saveData("aaa", "bbb", 100, 100, 100)).to.be.ok
    
            await expect(arkreenNotary.connect(deployer).saveData("aaa", "b", 99, 100, 100)).to.be.revertedWith("blockHeight data must increase!")
            await expect(arkreenNotary.connect(deployer).saveData("aaa", "b", 100, 99, 100)).to.be.revertedWith("totalPowerGeneraton data must increase!")
            await expect(arkreenNotary.connect(deployer).saveData("aaa", "b", 100, 100, 99)).to.be.revertedWith("circulatingSupply data must increase!")
        })
    
        it("user can not save data except the owner", async function () {
    
            const {arkreenNotary, deployer, user1, user2} = await deployFixture()
    
            expect(await arkreenNotary.owner()).to.be.equal(deployer.address)
            await expect(arkreenNotary.connect(user1).saveData("aaa", "bbb", 100, 100, 100)).to.be.revertedWith("Ownable: caller is not the owner")
    
        });
    })



})