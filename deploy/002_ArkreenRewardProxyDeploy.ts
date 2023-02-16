import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";


const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {

    const arkreenReward_V1 = "ArkreenRewardV1"

     // Need to check and update !!!!!
    const AKRE_TOKEN_ADDRESS    = "0x516aEEf988C3D90276422758347d11a8100C2460"  
    const VALIDATOR_ADDRESS     = "0x2161DedC3Be05B7Bb5aa16154BcbD254E9e9eb68"  //deployer or 

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log(`Proxy Deploying: ${arkreenReward_V1} from ${deployer}`);  
    const ArkreenRewardV1 = await deploy(arkreenReward_V1, {
        from: deployer,
        proxy: {
          proxyContract: "UUPSProxy",
          execute: {
            init: {
              methodName: "initialize",   // Function to call when deployed first time.
              args: [AKRE_TOKEN_ADDRESS, VALIDATOR_ADDRESS]
            },
          },
        },
        log: true,
        skipIfAlreadyDeployed: false,
    });

    console.log("ArkreenRewardV1 deployed to %s: ", hre.network.name, ArkreenRewardV1.address);
};

func.tags = ["ArkreenR_V1_P"];

export default func;
