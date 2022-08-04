const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const [signer0, signer1, signer2, signer3] = await ethers.getSigners();
  const chainId = await getChainId();

  await deploy("DAOMembershipToken", {
    from: deployer,
    // args: [],
    log: true,
    waitConfirmations: 1,
  });

  const DAOMembershipToken = await ethers.getContract(
    "DAOMembershipToken",
    deployer
  );
};

module.exports.tags = ["DAOMembershipToken"];
