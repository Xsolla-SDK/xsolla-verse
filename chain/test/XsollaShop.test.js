import { loadTestEnv } from "./helpers.js";

describe("XsollaShop (XSOLLA-only)", function () {
  let expect;
  let ethers;

  before(async function () {
    ({ expect, ethers } = await loadTestEnv());
  });
  async function fixture() {
    const [owner, buyer, studio] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("XsollaToken");
    const token = await Token.deploy(owner.address);
    await token.waitForDeployment();
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

    await shop.listItem(
      ethers.parseEther("10"),
      "Neon Card Back",
      "ipfs://xsolla/games/holdem/neon-card-back.json",
      "Texas Hold'em",
    );

    return { token, items, shop, owner, buyer, studio };
  }

  it("lists an item under a video game", async function () {
    const { shop } = await fixture();
    const listing = await shop.getListing(1);
    expect(listing[0]).to.equal(ethers.parseEther("10"));
    expect(listing[1]).to.equal(true);
    expect(listing[2]).to.equal("Neon Card Back");
    expect(listing[4]).to.equal("Texas Hold'em");
  });

  it("buys item with XSOLLA only", async function () {
    const { token, items, shop, owner, buyer } = await fixture();
    await token
      .connect(buyer)
      .approve(await shop.getAddress(), ethers.parseEther("20"));

    const ownerBefore = await token.balanceOf(owner.address);
    await shop.connect(buyer).buy(1, 2);
    const ownerAfter = await token.balanceOf(owner.address);

    expect(ownerAfter - ownerBefore).to.equal(ethers.parseEther("20"));
    expect(await items.balanceOf(buyer.address, 1)).to.equal(2n);
  });

  it("splits XSOLLA between studio and Verse", async function () {
    const { token, shop, owner, buyer, studio } = await fixture();
    await shop.listEcosystemItem(
      ethers.parseEther("10"),
      "WEBLAUNCH Bundle",
      "ipfs://xsolla/games/marvel-snap/weblaunch-bundle.json",
      "MARVEL SNAP",
      "pack",
      "",
      studio.address,
      8000,
      false,
    );
    await token
      .connect(buyer)
      .approve(await shop.getAddress(), ethers.parseEther("10"));
    const verseBefore = await token.balanceOf(owner.address);
    const studioBefore = await token.balanceOf(studio.address);
    await shop.connect(buyer).buy(2, 1);
    expect((await token.balanceOf(studio.address)) - studioBefore).to.equal(
      ethers.parseEther("8"),
    );
    expect((await token.balanceOf(owner.address)) - verseBefore).to.equal(
      ethers.parseEther("2"),
    );
  });

  it("rejects inactive listings", async function () {
    const { token, shop, buyer } = await fixture();
    await shop.updateItem(
      1,
      ethers.parseEther("10"),
      false,
      "Neon Card Back",
      "ipfs://xsolla/games/holdem/neon-card-back.json",
      "Texas Hold'em",
    );
    await token
      .connect(buyer)
      .approve(await shop.getAddress(), ethers.parseEther("10"));
    await expect(shop.connect(buyer).buy(1, 1)).to.be.revertedWith(
      "Item not for sale",
    );
  });

  it("lets a registered studio list a game then a pack", async function () {
    const { token, shop, buyer, studio } = await fixture();
    await shop.setStudio(studio.address, true);
    await shop
      .connect(studio)
      .registerGame(
        "Studio Game",
        "Indie title",
        "ipfs://cover.json",
        "https://studio.example/play",
        "PC, iOS",
      );
    const game = await shop.getGame(1);
    expect(game[0]).to.equal(studio.address);
    expect(game[1]).to.equal("Studio Game");
    expect(game[4]).to.equal("https://studio.example/play");
    expect(game[5]).to.equal("PC, iOS");
    await shop
      .connect(studio)
      .listForStudio(
        ethers.parseEther("12"),
        "Studio Pack",
        "ipfs://studio/pack.json",
        1,
        "pack",
        8000,
      );
    const listing = await shop.getListing(2);
    expect(listing[4]).to.equal("Studio Game");
    expect(listing[7]).to.equal(studio.address);
    expect(await shop.itemGameId(2)).to.equal(1n);
    await token
      .connect(buyer)
      .approve(await shop.getAddress(), ethers.parseEther("12"));
    const studioBefore = await token.balanceOf(studio.address);
    await expect(shop.connect(buyer).buy(2, 1))
      .to.emit(shop, "ItemPurchased")
      .withArgs(
        buyer.address,
        2n,
        studio.address,
        1n,
        ethers.parseEther("12"),
        ethers.parseEther("9.6"),
        ethers.parseEther("2.4"),
      );
    expect((await token.balanceOf(studio.address)) - studioBefore).to.equal(
      ethers.parseEther("9.6"),
    );
  });

  it("rejects unregistered studios and splits above 80%", async function () {
    const { shop, buyer, studio } = await fixture();
    await expect(
      shop
        .connect(buyer)
        .listForStudio(
          ethers.parseEther("10"),
          "Fake Pack",
          "ipfs://x.json",
          1,
          "pack",
          8000,
        ),
    ).to.be.revertedWith("Not a studio");
    await shop.setStudio(studio.address, true);
    await expect(
      shop
        .connect(studio)
        .listForStudio(
          ethers.parseEther("10"),
          "Greedy Pack",
          "ipfs://x.json",
          1,
          "pack",
          8001,
        ),
    ).to.be.revertedWith("Split too high");
    await expect(
      shop
        .connect(studio)
        .listForStudio(
          ethers.parseEther("10"),
          "Bounty",
          "ipfs://x.json",
          1,
          "bounty",
          8000,
        ),
    ).to.be.revertedWith("Invalid kind");
    await expect(
      shop.connect(studio).registerGame("", "x", "", "", ""),
    ).to.be.revertedWith("Invalid name");
    await shop
      .connect(studio)
      .registerGame("Studio Game", "Indie", "", "https://studio.example", "PC");
    await expect(
      shop
        .connect(studio)
        .listForStudio(
          ethers.parseEther("10"),
          "Pack",
          "ipfs://x.json",
          99,
          "pack",
          8000,
        ),
    ).to.be.revertedWith("Unknown game");
  });

  it("blocks transfers of soulbound items", async function () {
    const { token, items, shop, buyer, studio } = await fixture();
    await shop.listEcosystemItem(
      ethers.parseEther("8"),
      "Certified Playtester",
      "ipfs://playtester.json",
      "XsollaVerse",
      "bounty",
      "playtest",
      ethers.ZeroAddress,
      0,
      true,
    );
    await token
      .connect(buyer)
      .approve(await shop.getAddress(), ethers.parseEther("8"));
    await shop.connect(buyer).buy(2, 1);
    await expect(
      items
        .connect(buyer)
        .safeTransferFrom(buyer.address, studio.address, 2, 1, "0x"),
    ).to.be.revertedWith("Soulbound");
  });
});
