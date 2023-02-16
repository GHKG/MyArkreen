import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";


const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {

    const arkreenToken_V1 = "ArkreenTokenV1"

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // const FOUNDATION_ADDRESS   = "0x1C9055Db231CD96447c61D07B3cEA77592154C3d"  //from Gery
    const FOUNDATION_ADDRESS = deployer
    const TOTAL_NUMBER = 10000000000

    // console.log("Deploying: ", gToken, deployer);  
    console.log(`Proxy deploying: ${arkreenToken_V1} from ${deployer}`);  
    const ArkreenTokenV1 = await deploy(arkreenToken_V1, {
        from: deployer,
        proxy: {
          proxyContract: "UUPSProxy",     //use UUPSProxy contract as proxy contract
          execute: {
            init: {
              methodName: "initialize",   // Function to call when deployed first time.
              args: [TOTAL_NUMBER, FOUNDATION_ADDRESS]
            },
          },
        },
        log: true,
        skipIfAlreadyDeployed: false,
    });

    console.log("ArkreenTokenV1 deployed to %s: ", hre.network.name, ArkreenTokenV1.address);
  
};

func.tags = ["ArkreenT_V1_P"];

export default func;
