import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
//import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {

    const arkreenToken_V2 = "ArkreenTokenV2"

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log(`Driect Deploying: ${arkreenToken_V2} from ${deployer}`); 
    const ArkreenTokenV2 = await deploy(arkreenToken_V2, {
        from: deployer,
        args: [],
        log: true,
        skipIfAlreadyDeployed: false,
    });

    console.log("ArkreenToken deployed to %s: ", hre.network.name, ArkreenTokenV2.address);
};

func.tags = ["ArkreenT_V2_D"];

export default func;