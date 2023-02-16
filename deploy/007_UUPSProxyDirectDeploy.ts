// 该脚本用于为同一个实现部署多个代理

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// import { ethers, upgrades } from "hardhat";
// import { CONTRACTS } from "../constants";
import {ArkreenRewardV1__factory } from "../typechain";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {

  console.log("Deploying UUPSProxy...");  

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying: ", "UUPSProxy", deployer);  

  /* // Verification is difficult in this deplyment mode 
  const ArkreenMinerV10Factory = await ethers.getContractFactory("ArkreenMinerV10");
  const ArkreenMinerV10 = await ArkreenMinerV10Factory.deploy();
  await ArkreenMinerV10.deployed();
  */
  const IMPLEMENTA_ADDRESS = "0xb5cd4ef8d470e093b82ae86e5508c17d8c40c4ae"        // implementation addreess
  const AKREToken_ADDRESS = "0x516aEEf988C3D90276422758347d11a8100C2460"
  const Validation_ADDRESS = "0x2161DedC3Be05B7Bb5aa16154BcbD254E9e9eb68"

  const callData = ArkreenRewardV1__factory.createInterface().encodeFunctionData("initialize",
                                           [AKREToken_ADDRESS as string, Validation_ADDRESS as string])

  console.log("IMPLEMENTA_ADDRESS, deployer, callData", IMPLEMENTA_ADDRESS, deployer, callData)

  const UUPSProxyContract = await deploy("UUPSProxy", {
      from: deployer,
      args: [IMPLEMENTA_ADDRESS, deployer, callData],
      log: true,
      skipIfAlreadyDeployed: false,
  });
  
  console.log("UUPSProxy deployed to %s: ", hre.network.name, UUPSProxyContract.address);

};

export default func;
func.tags = ["UUPSProxy_D"];