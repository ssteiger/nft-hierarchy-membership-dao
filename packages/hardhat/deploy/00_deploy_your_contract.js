const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const [signer0, signer1, signer2, signer3] = await ethers.getSigners();
  const chainId = await getChainId();

  const initialReputationLevels = [0, 100, 500, 1000, 5000];
  const initialReputationLevelBaseUris = [
    "ipfs://0.com/",
    "ipfs://100.com/",
    "ipfs://500.com/",
    "ipfs://1000.com/",
    "ipfs://5000.com/",
  ];

  await deploy("DAOMembershipToken", {
    from: deployer,
    args: [initialReputationLevels, initialReputationLevelBaseUris],
    log: true,
    waitConfirmations: 1,
  });

  const DAOMembershipToken = await ethers.getContract(
    "DAOMembershipToken",
    deployer
  );
};

module.exports.tags = ["DAOMembershipToken"];
