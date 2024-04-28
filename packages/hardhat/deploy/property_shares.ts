






import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

interface DeployedContracts {
  PropertyNFT: Contract;
  PropertyShares: Contract;
}

const deployPropertyShares: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy the PropertyNFT contract
  const propertyNFTDeployment = await deploy("PropertyNFT", {
    from: deployer,
    log: true,
    // Optional: specify constructor arguments if needed
    args: [],
  });
  const PropertyNFT = await hre.ethers.getContract("PropertyNFT", deployer) as Contract;
  console.log("PropertyNFT contract deployed at:", propertyNFTDeployment.address);

  // Deploy the PropertyShares contract with the address of PropertyNFT contract
  const propertySharesDeployment = await deploy("PropertyShares", {
    from: deployer,
    log: true,
    // Pass the address of PropertyNFT contract as an argument
    args: [propertyNFTDeployment.address],
  });
  const PropertyShares = await hre.ethers.getContract("PropertyShares", deployer) as Contract;
  console.log("PropertyShares contract deployed at:", propertySharesDeployment.address);

  // Optionally, you can store the deployed contracts in an object for further use
  const deployedContracts: DeployedContracts = {
    PropertyNFT,
    PropertyShares,
  };

  // Now you can access the addresses using the contracts object
  console.log("PropertyNFT address:", deployedContracts.PropertyNFT.address);
  console.log("PropertyShares address:", deployedContracts.PropertyShares.address);
};

export default deployPropertyShares;

deployPropertyShares.tags = ["PropertyShares"];
