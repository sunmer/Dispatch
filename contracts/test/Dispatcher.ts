import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Dispatcher", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Dispatcher = await ethers.getContractFactory("Dispatcher");
    const dispatcher = await Dispatcher.deploy();
    await dispatcher.initialize();

    return { dispatcher, owner, otherAccount };
  }

  describe("createComment", function () {  // Updated the function name to "createComment"
    it("Should create a comment without a fundraiser ID", async function () {
      const { dispatcher, otherAccount } = await loadFixture(deployFixture);
      const commentContent = "This is my comment";  // Updated variable name to "commentContent"

      await expect(dispatcher.connect(otherAccount).createComment(commentContent, 0)) // Updated the function name to "createComment"
        .to.emit(dispatcher, "CommentCreated")  // Updated the event name to "CommentCreated"
        .withArgs(0, 0, otherAccount.address, commentContent);
    });

    it("Should revert on empty content", async function () {
      const { dispatcher } = await loadFixture(deployFixture);
      await expect(dispatcher.createComment("", 0)).to.be.revertedWith("Content is empty"); // Updated the function name to "createComment"
    });

    // Add more tests...
  });

  describe("createFundraiser", function() {
    it("Should create a fundraiser", async function() {
      const { dispatcher, otherAccount } = await loadFixture(deployFixture);
      const fundraiserContent = "Support my cause";
      const goalAmount = ethers.parseEther("10");
      const latestBlock = await ethers.provider.getBlock('latest');
      const deadline = latestBlock!.timestamp + 86400;  // 24 hours from now

      await expect(dispatcher.connect(otherAccount).createFundraiser(fundraiserContent, goalAmount, deadline))
        .to.emit(dispatcher, "FundraiserCreated")
        .withArgs(0, otherAccount.address, fundraiserContent, goalAmount, deadline);
    });

    // Add more tests...
  });

  describe("contribute", function() {
    it("Should allow contributions to a fundraiser", async function() {
      const { dispatcher, owner } = await loadFixture(deployFixture);
      const fundraiserContent = "Support my cause";
      const goalAmount = ethers.parseEther("10");
      const latestBlock = await ethers.provider.getBlock('latest');
      const deadline = latestBlock!.timestamp + 86400;  // 24 hours from now
      await dispatcher.connect(owner).createFundraiser(fundraiserContent, goalAmount, deadline);

      const contributionAmount = ethers.parseEther("1");

      await expect(dispatcher.connect(owner).contribute(0, { value: contributionAmount }))
        .to.emit(dispatcher, "Contribution")
        .withArgs(0, owner.address, contributionAmount);
    });

    // Add more tests...
  });

  describe("claimFundraiserAmount", function() {
    it("Should allow fundraiser creator to claim when goal is met", async function() {
      // Add setup and test here...
    });

    // Add more tests...
  });

  describe("claimRefund", function() {
    it("Should allow contributors to claim a refund when fundraiser goal is not met", async function() {
      // Add setup and test here...
    });

    // Add more tests...
  });

  describe("claimFees", function() {
    it("Should allow owner to claim accumulated fees", async function() {
      // Add setup and test here...
    });

    // Add more tests...
  });
});
