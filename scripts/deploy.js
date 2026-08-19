const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  console.log("Deploying with:", deployer.address);

  const XsollaToken = await hre.ethers.getContractFactory("XsollaToken");
  const token = await XsollaToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("XsollaToken:", tokenAddress);

  let usdcAddress = process.env.USDC_ADDRESS || "";
  let usdcContract = null;
  if (!usdcAddress) {
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    usdcContract = await MockUSDC.deploy();
    await usdcContract.waitForDeployment();
    usdcAddress = await usdcContract.getAddress();
    console.log("MockUSDC:", usdcAddress);
    await (await usdcContract.mint(deployer.address, hre.ethers.parseUnits("1000000", 6))).wait();
  } else {
    console.log("Using existing USDC:", usdcAddress);
  }

  let usdtAddress = process.env.USDT_ADDRESS || "";
  let usdtContract = null;
  if (!usdtAddress) {
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    usdtContract = await MockUSDT.deploy();
    await usdtContract.waitForDeployment();
    usdtAddress = await usdtContract.getAddress();
    console.log("MockUSDT:", usdtAddress);
    await (await usdtContract.mint(deployer.address, hre.ethers.parseUnits("1000000", 6))).wait();
  } else {
    console.log("Using existing USDT:", usdtAddress);
  }

  const XsollaTreasury = await hre.ethers.getContractFactory("XsollaTreasury");
  const treasury = await XsollaTreasury.deploy(
    tokenAddress,
    deployer.address,
    usdcAddress,
    usdtAddress,
  );
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("XsollaTreasury:", treasuryAddress);

  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    for (const signer of signers.slice(0, 6)) {
      await (
        await token.mint(signer.address, hre.ethers.parseEther("10000"))
      ).wait();
    }
    console.log("Seeded local demo accounts with 10,000 XSOLLA each");
  }

  await (await token.setMinter(treasuryAddress)).wait();
  console.log("Minter set to treasury");

  // Item shop (XSOLLA-only payments)
  const XsollaItems = await hre.ethers.getContractFactory("XsollaItems");
  const items = await XsollaItems.deploy(deployer.address);
  await items.waitForDeployment();
  const itemsAddress = await items.getAddress();
  console.log("XsollaItems:", itemsAddress);

  const XsollaShop = await hre.ethers.getContractFactory("XsollaShop");
  const shop = await XsollaShop.deploy(tokenAddress, itemsAddress, deployer.address);
  await shop.waitForDeployment();
  const shopAddress = await shop.getAddress();
  console.log("XsollaShop:", shopAddress);

  await (await items.setMinter(shopAddress)).wait();
  console.log("Items minter set to shop");

  const studioAddr = (i) => (signers[i] ? signers[i].address : deployer.address);
  const studios = {
    verse: deployer.address,
    secondDinner: studioAddr(1),
    mytona: studioAddr(2),
    gdap: studioAddr(3),
    dtiEmb: studioAddr(4),
  };
  for (const [key, addr] of Object.entries(studios)) {
    if (key === "verse") continue;
    await (await shop.setStudio(addr, true)).wait();
    console.log("Studio allowlisted:", key, addr);
  }
  const zero = hre.ethers.ZeroAddress;

  const starterItems = [
    {
      game: 'MARVEL SNAP',
      price: hre.ethers.parseEther('18'),
      name: 'WEBLAUNCH Bundle',
      uri: 'ipfs://xsolla/games/marvel-snap/weblaunch-bundle.json',
      kind: 'pack',
      perk: '',
      studio: studios.secondDinner,
      studioBps: 8000,
    },
    {
      game: 'MARVEL SNAP',
      price: hre.ethers.parseEther('40'),
      name: 'Season Pass Boost',
      uri: 'ipfs://xsolla/games/marvel-snap/season-pass-boost.json',
      kind: 'pack',
      perk: 'season',
      studio: studios.secondDinner,
      studioBps: 8000,
    },
    {
      game: 'Cooking Diary',
      price: hre.ethers.parseEther('12'),
      name: 'Chef Starter Pack',
      uri: 'ipfs://xsolla/games/cooking-diary/chef-starter-pack.json',
      kind: 'pack',
      perk: '',
      studio: studios.mytona,
      studioBps: 8000,
    },
    {
      game: 'Cooking Diary',
      price: hre.ethers.parseEther('28'),
      name: 'Daily Gift Chest',
      uri: 'ipfs://xsolla/games/cooking-diary/daily-gift-chest.json',
      kind: 'pack',
      perk: '',
      studio: studios.mytona,
      studioBps: 8000,
    },
    {
      game: 'Seekers Notes',
      price: hre.ethers.parseEther('15'),
      name: 'Mystery Energy Pack',
      uri: 'ipfs://xsolla/games/seekers-notes/mystery-energy-pack.json',
      kind: 'pack',
      perk: '',
      studio: studios.mytona,
      studioBps: 8000,
    },
    {
      game: 'Seekers Notes',
      price: hre.ethers.parseEther('32'),
      name: 'Hidden Object Pass',
      uri: 'ipfs://xsolla/games/seekers-notes/hidden-object-pass.json',
      kind: 'pass',
      perk: 'season',
      studio: studios.mytona,
      studioBps: 8000,
    },
    {
      game: 'Chef & Friends',
      price: hre.ethers.parseEther('14'),
      name: 'Kitchen Crew Bundle',
      uri: 'ipfs://xsolla/games/chef-friends/kitchen-crew-bundle.json',
      kind: 'pack',
      perk: '',
      studio: studios.mytona,
      studioBps: 8000,
    },
    {
      game: 'Chef & Friends',
      price: hre.ethers.parseEther('26'),
      name: 'Friends Feast Pack',
      uri: 'ipfs://xsolla/games/chef-friends/friends-feast-pack.json',
      kind: 'pack',
      perk: '',
      studio: studios.mytona,
      studioBps: 8000,
    },
    {
      game: 'Ravenhill',
      price: hre.ethers.parseEther('16'),
      name: 'Ravenhill Case File',
      uri: 'ipfs://xsolla/games/ravenhill/case-file.json',
      kind: 'pack',
      perk: '',
      studio: studios.mytona,
      studioBps: 8000,
    },
    {
      game: 'Ravenhill',
      price: hre.ethers.parseEther('30'),
      name: 'Noir Detective Kit',
      uri: 'ipfs://xsolla/games/ravenhill/noir-detective-kit.json',
      kind: 'pack',
      perk: '',
      studio: studios.mytona,
      studioBps: 8000,
    },
    {
      game: 'GDAP Showcase',
      price: hre.ethers.parseEther('10'),
      name: 'Manila Indie Bundle',
      uri: 'ipfs://xsolla/games/gdap/manila-indie-bundle.json',
      kind: 'pack',
      perk: '',
      studio: studios.gdap,
      studioBps: 8000,
    },
    {
      game: 'GDAP Showcase',
      price: hre.ethers.parseEther('22'),
      name: 'Studio Launch Pack',
      uri: 'ipfs://xsolla/games/gdap/studio-launch-pack.json',
      kind: 'pack',
      perk: '',
      studio: studios.gdap,
      studioBps: 8000,
    },
    {
      game: 'DTI-EMB Export Hits',
      price: hre.ethers.parseEther('12'),
      name: 'Export Ready Pack',
      uri: 'ipfs://xsolla/games/dti-emb/export-ready-pack.json',
      kind: 'pack',
      perk: '',
      studio: studios.dtiEmb,
      studioBps: 8000,
    },
    {
      game: 'DTI-EMB Export Hits',
      price: hre.ethers.parseEther('24'),
      name: 'Global Payments Kit',
      uri: 'ipfs://xsolla/games/dti-emb/global-payments-kit.json',
      kind: 'pack',
      perk: '',
      studio: studios.dtiEmb,
      studioBps: 8000,
    },
    {
      game: "Texas Hold'em",
      price: hre.ethers.parseEther('10'),
      name: 'Neon Card Back',
      uri: 'ipfs://xsolla/games/holdem/neon-card-back.json',
      kind: 'cosmetic',
      perk: 'cardBack',
    },
    {
      game: "Texas Hold'em",
      price: hre.ethers.parseEther('25'),
      name: 'Gold Dealer Button',
      uri: 'ipfs://xsolla/games/holdem/gold-dealer-button.json',
      kind: 'cosmetic',
      perk: 'dealer',
    },
    {
      game: "Texas Hold'em",
      price: hre.ethers.parseEther('50'),
      name: 'VIP Table Theme',
      uri: 'ipfs://xsolla/games/holdem/vip-table-theme.json',
      kind: 'cosmetic',
      perk: 'tableTheme',
    },
    {
      game: "Texas Hold'em",
      price: hre.ethers.parseEther('22'),
      name: 'Rake Charm',
      uri: 'ipfs://xsolla/games/holdem/rake-charm.json',
      kind: 'utility',
      perk: 'rake',
    },
    {
      game: 'Blackjack',
      price: hre.ethers.parseEther('12'),
      name: 'Emerald Felt',
      uri: 'ipfs://xsolla/games/blackjack/emerald-felt.json',
      kind: 'cosmetic',
      perk: 'felt',
    },
    {
      game: 'Blackjack',
      price: hre.ethers.parseEther('20'),
      name: 'Chrome Chip Tray',
      uri: 'ipfs://xsolla/games/blackjack/chrome-chip-tray.json',
      kind: 'cosmetic',
      perk: 'tray',
    },
    {
      game: 'Blackjack',
      price: hre.ethers.parseEther('35'),
      name: 'High-Roller Seat',
      uri: 'ipfs://xsolla/games/blackjack/high-roller-seat.json',
      kind: 'cosmetic',
      perk: 'seat',
    },
    {
      game: 'XsollaVerse',
      price: hre.ethers.parseEther('15'),
      name: 'Avatar Frame: Ember',
      uri: 'ipfs://xsolla/games/metaverse/avatar-frame-ember.json',
      kind: 'cosmetic',
      perk: 'frame',
    },
    {
      game: 'XsollaVerse',
      price: hre.ethers.parseEther('30'),
      name: 'Lobby Banner: Neon',
      uri: 'ipfs://xsolla/games/metaverse/lobby-banner-neon.json',
      kind: 'cosmetic',
      perk: 'banner',
    },
    {
      game: 'XsollaVerse',
      price: hre.ethers.parseEther('25'),
      name: 'Ember Circuit Pass',
      uri: 'ipfs://xsolla/games/metaverse/ember-circuit-pass.json',
      kind: 'pass',
      perk: 'season',
    },
    {
      game: 'XsollaVerse',
      price: hre.ethers.parseEther('8'),
      name: 'Certified Playtester',
      uri: 'ipfs://xsolla/games/metaverse/certified-playtester.json',
      kind: 'bounty',
      perk: 'playtest',
      soulbound: true,
    },
    {
      game: 'XsollaVerse',
      price: hre.ethers.parseEther('18'),
      name: 'Market License',
      uri: 'ipfs://xsolla/games/metaverse/market-license.json',
      kind: 'utility',
      perk: 'market',
    },
  ];
  let licenseItemId = 0;
  const gameDestinations = {
    'MARVEL SNAP': {
      blurb: 'Xsolla partner · Second Dinner',
      playUrl: 'https://www.marvelsnap.com/',
      platforms: 'iOS, Android, PC',
    },
    'Cooking Diary': {
      blurb: 'Xsolla partner · Mytona',
      playUrl: 'https://mytona.com/games/cooking-diary',
      platforms: 'iOS, Android',
    },
    'Seekers Notes': {
      blurb: 'Hidden-object mystery · Mytona × Xsolla',
      playUrl: 'https://mytona.com/games/seekers-notes',
      platforms: 'iOS, Android',
    },
    'Chef & Friends': {
      blurb: 'Casual cooking co-op · Mytona',
      playUrl: 'https://mytona.com/games/chef-and-friends',
      platforms: 'iOS, Android',
    },
    Ravenhill: {
      blurb: 'Mystery adventure · Mytona',
      playUrl: 'https://mytona.com/games/ravenhill',
      platforms: 'iOS, Android',
    },
    'GDAP Showcase': {
      blurb: 'Philippine indie spotlight · GDAP × Xsolla',
      playUrl: 'https://www.gdap.org.ph/',
      platforms: 'PC, Mobile',
    },
    'DTI-EMB Export Hits': {
      blurb: 'Export-ready PH titles · DTI-EMB × Xsolla',
      playUrl: 'https://www.dti.gov.ph/',
      platforms: 'PC, Mobile',
    },
  };
  const seededGames = new Set();
  for (const item of starterItems) {
    if (!item.game || !item.studio || item.studio === zero) continue;
    const key = `${item.studio}:${item.game}`;
    if (seededGames.has(key)) continue;
    const dest = gameDestinations[item.game] || {};
    await (
      await shop.registerGameFor(
        item.studio,
        item.game,
        dest.blurb || '',
        '',
        dest.playUrl || '',
        dest.platforms || '',
      )
    ).wait();
    seededGames.add(key);
  }
  console.log(`Registered ${seededGames.size} studio games`);
  for (const item of starterItems) {
    await (
      await shop.listEcosystemItem(
        item.price,
        item.name,
        item.uri,
        item.game,
        item.kind || 'cosmetic',
        item.perk || '',
        item.studio || zero,
        item.studioBps || 0,
        !!item.soulbound,
      )
    ).wait();
    if (item.name === 'Market License') {
      licenseItemId = Number(await shop.nextItemId()) - 1;
    }
  }
  console.log(`Listed ${starterItems.length} ecosystem shop items`);

  const XsollaMarket = await hre.ethers.getContractFactory("XsollaMarket");
  const market = await XsollaMarket.deploy(
    tokenAddress,
    itemsAddress,
    shopAddress,
    deployer.address,
    licenseItemId,
  );
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("XsollaMarket:", marketAddress, "licenseItemId", licenseItemId);

  await (await shop.setStakeView(treasuryAddress)).wait();
  await (await market.setStakeView(treasuryAddress)).wait();
  console.log("Stake perks wired to shop + market");

  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    await deployer.sendTransaction({
      to: treasuryAddress,
      value: hre.ethers.parseEther("10"),
    });
    console.log("Seeded treasury with 10 ETH");

    const usdc =
      usdcContract || (await hre.ethers.getContractAt("MockUSDC", usdcAddress));
    await (await usdc.approve(treasuryAddress, hre.ethers.parseUnits("100000", 6))).wait();
    await (await treasury.fundUsdc(hre.ethers.parseUnits("100000", 6))).wait();
    console.log("Seeded treasury with 100,000 USDC");

    const usdt =
      usdtContract || (await hre.ethers.getContractAt("MockUSDT", usdtAddress));
    await (await usdt.approve(treasuryAddress, hre.ethers.parseUnits("100000", 6))).wait();
    await (await treasury.fundUsdt(hre.ethers.parseUnits("100000", 6))).wait();
    console.log("Seeded treasury with 100,000 USDT");
  }

  const deployment = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    XsollaToken: tokenAddress,
    XsollaTreasury: treasuryAddress,
    XsollaItems: itemsAddress,
    XsollaShop: shopAddress,
    XsollaMarket: marketAddress,
    licenseItemId: String(licenseItemId),
    studios,
    USDC: usdcAddress,
    USDT: usdtAddress,
    usdcPerXsolla: "1000000",
    usdtPerXsolla: "1000000",
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${hre.network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log("Wrote", outFile);

  const clientFile = path.join(
    __dirname,
    "..",
    "client",
    "src",
    "contracts",
    "addresses.json",
  );
  fs.mkdirSync(path.dirname(clientFile), { recursive: true });
  fs.writeFileSync(clientFile, JSON.stringify(deployment, null, 2));
  console.log("Wrote", clientFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
