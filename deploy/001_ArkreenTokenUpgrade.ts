import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ArkreenTokenV2__factory } from "../typechain";


const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    // const { deployerAddress } = await getNamedAccounts();

    // console.log("Deploying Updated ArkreenRetirement: ", CONTRACTS.RECRetire, deployerAddress);  
     
    if(hre.network.name === 'matic_test') {
        const PROXY_ADDRESS       = "0x516aEEf988C3D90276422758347d11a8100C2460"       // Need to check
        const NEW_IMPLEMENTATION  = "0xAE8c00Ae94c83b3519e2A5e0fC15a817F5B2E18C"       // Need to check
        //const FOUNDATION_ADDRESS  = "0x1C9055Db231CD96447c61D07B3cEA77592154C3d"  //from Gery        

        const [deployer] = await ethers.getSigners();
        const ArkreenTokenUpgradeableV2 = ArkreenTokenV2__factory.connect(PROXY_ADDRESS, deployer);

        //const callData = ArkreenTokenUpgradeableV2.interface.encodeFunctionData("postUpdate", [FOUNDATION_ADDRESS])
//      const callData = ArkreenTokenUpgradeableV2.interface.encodeFunctionData("postUpdate", [...])
        const updateTx = await ArkreenTokenUpgradeableV2.upgradeTo(NEW_IMPLEMENTATION)
        await updateTx.wait()

        // console.log("callData, update", callData, updateTx)
        console.log("ArkreenRetirement deployed to %s: ", hre.network.name, ArkreenTokenUpgradeableV2.address);
    } 
};

func.tags = ["ArkreenT_U"];

export default func;
