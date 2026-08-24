import { loadTestEnv } from "./helpers.js";

describe("XsollaMarket", function () {
  let expect;
  let ethers;

  before(async function () {
    ({ expect, ethers } = await loadTestEnv());
  });
  async function fixture() {
    const [owner, seller, buyer, studio] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("XsollaToken");
    const token = await Token.deploy(owner.address);
    await token.waitForDeployment();
    await token.mint(seller.address, ethers.parseEther("1000"));
    await token.mint(buyer.address, ethers.parseEther("1000"));

    const Items = await ethers.getContractFactory("XsollaItems");
    const items = await Items.deploy(owner.address);
    await items.waitForDeployment();

    const Shop = await ethers.getContractFactory("XsollaShop");
    const shop = await Shop.deploy(
      await token.getAddress(),
      await items.getAddress(),
      owner.address,
    );
    await shop.waitForDeployment();
    await items.setMinter(await shop.getAddress());

    await shop.listEcosystemItem(
      ethers.parseEther("10"),
      "Neon Card Back",
      "ipfs://card.json",
      "Texas Hold'em",
      "cosmetic",
      "cardBack",
      studio.address,
      1000,
      false,
    );

    await token
      .connect(seller)
      .approve(await shop.getAddress(), ethers.parseEther("10"));
    await shop.connect(seller).buy(1, 1);

    const Market = await ethers.getContractFactory("XsollaMarket");
    const market = await Market.deploy(
      await token.getAddress(),
      await items.getAddress(),
      await shop.getAddress(),
      owner.address,
      0,
    );
    await market.waitForDeployment();

    await items.connect(seller).setApprovalForAll(await market.getAddress(), true);

    return { token, items, shop, market, owner, seller, buyer, studio };
  }

  it("sells with studio royalty and market fee", async function () {
    const { token, items, market, owner, seller, buyer, studio } = await fixture();
    await market
      .connect(seller)
      .list(1, 1, ethers.parseEther("20"));

    await token
      .connect(buyer)
      .approve(await market.getAddress(), ethers.parseEther("20"));

    const studioBefore = await token.balanceOf(studio.address);
    const verseBefore = await token.balanceOf(owner.address);
    const sellerBefore = await token.balanceOf(seller.address);

    await expect(market.connect(buyer).buy(1))
      .to.emit(market, "OfferSold")
      .withArgs(
        1n,
        buyer.address,
        studio.address,
        1n,
        1n,
        ethers.parseEther("2"),
        ethers.parseEther("0.5"),
        ethers.parseEther("17.5"),
      );

    expect(await items.balanceOf(buyer.address, 1)).to.equal(1n);
    expect(await items.balanceOf(seller.address, 1)).to.equal(0n);
    // 10% studio of 20 = 2, 2.5% fee = 0.5, seller 17.5
    expect((await token.balanceOf(studio.address)) - studioBefore).to.equal(
      ethers.parseEther("2"),
    );
    expect((await token.balanceOf(owner.address)) - verseBefore).to.equal(
      ethers.parseEther("0.5"),
    );
    expect((await token.balanceOf(seller.address)) - sellerBefore).to.equal(
      ethers.parseEther("17.5"),
    );
  });
});
