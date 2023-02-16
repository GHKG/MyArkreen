import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";


const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {

    const arkreenNotary = "ArkreenNotary"

    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log(`Driect Deploying: ${arkreenNotary} from ${deployer}`); 
    const ArkreenNotary = await deploy(arkreenNotary, {
        from: deployer,
        args: [],
        log: true,
        skipIfAlreadyDeployed: false,
    });

    console.log("ArkreenNotary deployed to %s: ", hre.network.name, ArkreenNotary.address);
};

func.tags = ["ArkreenN_D"];

export default func;