














import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployPropertyNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy the PropertyNFT contract
  await deploy("PropertyNFT", {
    from: deployer,
    log: true,
    // Optional: specify constructor arguments if needed
    args: [],
  });

  // Get the deployed contract to interact with it after deploying.
  const PropertyNFT = await hre.ethers.getContract<Contract>("PropertyNFT", deployer);

  console.log("PropertyNFT contract deployed at:", PropertyNFT.address);
};

export default deployPropertyNFT;
