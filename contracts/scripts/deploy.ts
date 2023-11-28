import { ethers, upgrades } from "hardhat";

const PROXY_CONTRACT_ADDRESS = "0x9A65362A9Aa3423739F534EE03C5a91dbFCb1bf5";

async function deployInitial() {
  const Dispatcher = await ethers.getContractFactory("Dispatcher");
  const proxy = await upgrades.deployProxy(Dispatcher, [], {
    initializer: "initialize",
  });
  
  await proxy.waitForDeployment();

  console.log("Dispatcher initial proxy deployed to:", proxy.target);
}

async function deployUpgrade(contract: string) {
  const DispatcherUpgraded = await ethers.getContractFactory(contract);
  const dispatcherUpgraded = await upgrades.upgradeProxy(PROXY_CONTRACT_ADDRESS, DispatcherUpgraded);
  console.log(`Dispatcher proxy ${contract} upgraded at: ` + dispatcherUpgraded.target);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const adminAddress = deployer.address;

  //const dispatcherAddress = await deployInitial();
  await deployUpgrade("Dispatcher01");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
