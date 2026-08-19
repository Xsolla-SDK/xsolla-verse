// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./XsollaToken.sol";

/**
 * @title XsollaTreasury
 * @notice Buy / escrow / stake / swap hub for XSOLLA.
 */
contract XsollaTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    XsollaToken public immutable token;
    IERC20 public usdc;
    IERC20 public usdt;

    address public operator;
    bool public demoMode = true;

    /// @notice Stable base units (6 decimals) per 1 full XSOLLA (1e18 wei). Default 1:1.
    uint256 public usdcPerXsolla = 1e6;
    uint256 public usdtPerXsolla = 1e6;

    mapping(address => uint256) public playCredits;
    mapping(address => uint256) public staked;
    mapping(address => uint256) public pendingUnstake;
    mapping(address => uint256) public unstakeUnlockAt;

    uint256 public constant TIER1 = 100 ether;
    uint256 public constant TIER2 = 500 ether;
    uint256 public constant TIER3 = 2000 ether;
    uint256 public unstakeDelay = 60;

    event Bought(address indexed user, uint256 amount);
    event BoughtWithUsdc(address indexed user, uint256 xsollaAmount, uint256 usdcAmount);
    event BoughtWithUsdt(address indexed user, uint256 xsollaAmount, uint256 usdtAmount);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockAt);
    event UnstakeCompleted(address indexed user, uint256 amount);
    event UnstakeCancelled(address indexed user, uint256 amount);
    event UnstakeDelayUpdated(uint256 unstakeDelay);
    event Swapped(address indexed user, uint256 amount);
    event SwappedXsollaForUsdc(address indexed user, uint256 xsollaAmount, uint256 usdcAmount);
    event SwappedUsdcForXsolla(address indexed user, uint256 usdcAmount, uint256 xsollaAmount);
    event SwappedXsollaForUsdt(address indexed user, uint256 xsollaAmount, uint256 usdtAmount);
    event SwappedUsdtForXsolla(address indexed user, uint256 usdtAmount, uint256 xsollaAmount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event OperatorUpdated(address indexed operator);
    event DemoModeUpdated(bool enabled);
    event UsdcUpdated(address indexed usdc);
    event UsdtUpdated(address indexed usdt);
    event UsdcRateUpdated(uint256 usdcPerXsolla);
    event UsdtRateUpdated(uint256 usdtPerXsolla);

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == owner(), "Not operator");
        _;
    }

    constructor(
        address tokenAddress,
        address initialOperator,
        address usdcAddress,
        address usdtAddress
    ) {
        require(tokenAddress != address(0), "Invalid token");
        token = XsollaToken(tokenAddress);
        operator = initialOperator == address(0) ? msg.sender : initialOperator;
        if (usdcAddress != address(0)) {
            usdc = IERC20(usdcAddress);
        }
        if (usdtAddress != address(0)) {
            usdt = IERC20(usdtAddress);
        }
    }

    receive() external payable {}

    function setOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "Invalid operator");
        operator = newOperator;
        emit OperatorUpdated(newOperator);
    }

    function setDemoMode(bool enabled) external onlyOwner {
        demoMode = enabled;
        unstakeDelay = enabled ? 60 : 14 days;
        emit DemoModeUpdated(enabled);
        emit UnstakeDelayUpdated(unstakeDelay);
    }

    function setUnstakeDelay(uint256 delay) external onlyOwner {
        unstakeDelay = delay;
        emit UnstakeDelayUpdated(delay);
    }

    function setUsdc(address usdcAddress) external onlyOwner {
        require(usdcAddress != address(0), "Invalid USDC");
        usdc = IERC20(usdcAddress);
        emit UsdcUpdated(usdcAddress);
    }

    function setUsdt(address usdtAddress) external onlyOwner {
        require(usdtAddress != address(0), "Invalid USDT");
        usdt = IERC20(usdtAddress);
        emit UsdtUpdated(usdtAddress);
    }

    function setUsdcPerXsolla(uint256 rate) external onlyOwner {
        require(rate > 0, "Invalid rate");
        usdcPerXsolla = rate;
        emit UsdcRateUpdated(rate);
    }

    function setUsdtPerXsolla(uint256 rate) external onlyOwner {
        require(rate > 0, "Invalid rate");
        usdtPerXsolla = rate;
        emit UsdtRateUpdated(rate);
    }

    function quoteXsollaToUsdc(uint256 xsollaAmount) public view returns (uint256) {
        return (xsollaAmount * usdcPerXsolla) / 1e18;
    }

    function quoteUsdcToXsolla(uint256 usdcAmount) public view returns (uint256) {
        return (usdcAmount * 1e18) / usdcPerXsolla;
    }

    function quoteXsollaToUsdt(uint256 xsollaAmount) public view returns (uint256) {
        return (xsollaAmount * usdtPerXsolla) / 1e18;
    }

    function quoteUsdtToXsolla(uint256 usdtAmount) public view returns (uint256) {
        return (usdtAmount * 1e18) / usdtPerXsolla;
    }

    /// @notice Buy XSOLLA 1:1 with native gas token (POL/ETH).
    function buyXsolla() external payable nonReentrant {
        require(msg.value > 0, "Zero value");
        token.mint(msg.sender, msg.value);
        emit Bought(msg.sender, msg.value);
    }

    /// @notice Buy XSOLLA with USDC at the configured rate (mints XSOLLA).
    function buyXsollaWithUsdc(uint256 usdcAmount) external nonReentrant {
        require(address(usdc) != address(0), "USDC not set");
        require(usdcAmount > 0, "Zero amount");
        uint256 xsollaAmount = quoteUsdcToXsolla(usdcAmount);
        require(xsollaAmount > 0, "Amount too small");
        usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
        token.mint(msg.sender, xsollaAmount);
        emit BoughtWithUsdc(msg.sender, xsollaAmount, usdcAmount);
        emit SwappedUsdcForXsolla(msg.sender, usdcAmount, xsollaAmount);
    }

    /// @notice Lock XSOLLA into play escrow.
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        playCredits[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    /// @notice Demo withdraw from escrow (disable in production).
    function withdrawPlayCredits(uint256 amount) external nonReentrant {
        require(demoMode, "Demo disabled; use operator release");
        require(amount > 0, "Zero amount");
        require(playCredits[msg.sender] >= amount, "Insufficient credits");
        playCredits[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Production cash-out: backend operator releases escrowed XSOLLA.
    function release(address user, uint256 amount) external onlyOperator nonReentrant {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Zero amount");
        require(playCredits[user] >= amount, "Insufficient credits");
        playCredits[user] -= amount;
        require(token.transfer(user, amount), "Transfer failed");
        emit Withdrawn(user, amount);
    }

    /// @notice Operator can credit escrow (e.g. sync off-chain winnings).
    function operatorCredit(address user, uint256 amount) external onlyOperator nonReentrant {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Zero amount");
        token.mint(address(this), amount);
        playCredits[user] += amount;
        emit Deposited(user, amount);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        staked[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function requestUnstake(uint256 amount) public nonReentrant {
        _requestUnstake(amount);
    }

    function completeUnstake() public nonReentrant {
        uint256 amount = pendingUnstake[msg.sender];
        require(amount > 0, "Nothing pending");
        require(block.timestamp >= unstakeUnlockAt[msg.sender], "Locked");
        pendingUnstake[msg.sender] = 0;
        unstakeUnlockAt[msg.sender] = 0;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit UnstakeCompleted(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function cancelUnstake() external nonReentrant {
        uint256 amount = pendingUnstake[msg.sender];
        require(amount > 0, "Nothing pending");
        pendingUnstake[msg.sender] = 0;
        unstakeUnlockAt[msg.sender] = 0;
        staked[msg.sender] += amount;
        emit UnstakeCancelled(msg.sender, amount);
    }

    /// @notice Instant unstake when delay is 0; otherwise queues a delayed unstake.
    function unstake(uint256 amount) external nonReentrant {
        if (unstakeDelay == 0) {
            _unstakeNow(amount);
        } else {
            _requestUnstake(amount);
        }
    }

    function _requestUnstake(uint256 amount) internal {
        require(amount > 0, "Zero amount");
        require(staked[msg.sender] >= amount, "Insufficient stake");
        staked[msg.sender] -= amount;
        pendingUnstake[msg.sender] += amount;
        uint256 unlockAt = block.timestamp + unstakeDelay;
        unstakeUnlockAt[msg.sender] = unlockAt;
        emit UnstakeRequested(msg.sender, amount, unlockAt);
    }

    function _unstakeNow(uint256 amount) internal {
        require(amount > 0, "Zero amount");
        require(staked[msg.sender] >= amount, "Insufficient stake");
        staked[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    function stakeTier(address user) public view returns (uint8) {
        uint256 s = staked[user];
        if (s >= TIER3) return 3;
        if (s >= TIER2) return 2;
        if (s >= TIER1) return 1;
        return 0;
    }

    function shopDiscountBps(address user) external view returns (uint16) {
        return stakeTier(user) >= 1 ? 200 : 0;
    }

    function marketFeeBps(address user) external view returns (uint16) {
        return stakeTier(user) >= 1 ? 200 : 250;
    }

    /// @notice Swap XSOLLA → USDC from treasury liquidity.
    function swapXsollaForUsdc(uint256 xsollaAmount) external nonReentrant {
        require(address(usdc) != address(0), "USDC not set");
        require(xsollaAmount > 0, "Zero amount");
        uint256 usdcAmount = quoteXsollaToUsdc(xsollaAmount);
        require(usdcAmount > 0, "Amount too small");
        require(usdc.balanceOf(address(this)) >= usdcAmount, "Insufficient USDC liquidity");
        require(token.transferFrom(msg.sender, address(this), xsollaAmount), "Transfer failed");
        usdc.safeTransfer(msg.sender, usdcAmount);
        emit SwappedXsollaForUsdc(msg.sender, xsollaAmount, usdcAmount);
    }

    /// @notice Swap USDC → XSOLLA.
    function swapUsdcForXsolla(uint256 usdcAmount) external nonReentrant {
        require(address(usdc) != address(0), "USDC not set");
        require(usdcAmount > 0, "Zero amount");
        uint256 xsollaAmount = quoteUsdcToXsolla(usdcAmount);
        require(xsollaAmount > 0, "Amount too small");
        usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);
        token.mint(msg.sender, xsollaAmount);
        emit SwappedUsdcForXsolla(msg.sender, usdcAmount, xsollaAmount);
        emit BoughtWithUsdc(msg.sender, xsollaAmount, usdcAmount);
    }

    /// @notice Buy XSOLLA with USDT at the configured rate (mints XSOLLA).
    function buyXsollaWithUsdt(uint256 usdtAmount) external nonReentrant {
        require(address(usdt) != address(0), "USDT not set");
        require(usdtAmount > 0, "Zero amount");
        uint256 xsollaAmount = quoteUsdtToXsolla(usdtAmount);
        require(xsollaAmount > 0, "Amount too small");
        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);
        token.mint(msg.sender, xsollaAmount);
        emit BoughtWithUsdt(msg.sender, xsollaAmount, usdtAmount);
        emit SwappedUsdtForXsolla(msg.sender, usdtAmount, xsollaAmount);
    }

    /// @notice Swap XSOLLA → USDT from treasury liquidity.
    function swapXsollaForUsdt(uint256 xsollaAmount) external nonReentrant {
        require(address(usdt) != address(0), "USDT not set");
        require(xsollaAmount > 0, "Zero amount");
        uint256 usdtAmount = quoteXsollaToUsdt(xsollaAmount);
        require(usdtAmount > 0, "Amount too small");
        require(usdt.balanceOf(address(this)) >= usdtAmount, "Insufficient USDT liquidity");
        require(token.transferFrom(msg.sender, address(this), xsollaAmount), "Transfer failed");
        usdt.safeTransfer(msg.sender, usdtAmount);
        emit SwappedXsollaForUsdt(msg.sender, xsollaAmount, usdtAmount);
    }

    /// @notice Swap USDT → XSOLLA.
    function swapUsdtForXsolla(uint256 usdtAmount) external nonReentrant {
        require(address(usdt) != address(0), "USDT not set");
        require(usdtAmount > 0, "Zero amount");
        uint256 xsollaAmount = quoteUsdtToXsolla(usdtAmount);
        require(xsollaAmount > 0, "Amount too small");
        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);
        token.mint(msg.sender, xsollaAmount);
        emit SwappedUsdtForXsolla(msg.sender, usdtAmount, xsollaAmount);
        emit BoughtWithUsdt(msg.sender, xsollaAmount, usdtAmount);
    }

    /// @notice Swap XSOLLA back to native 1:1 when treasury holds liquidity.
    function swapXsollaForNative(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(address(this).balance >= amount, "Insufficient liquidity");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Native transfer failed");
        emit Swapped(msg.sender, amount);
    }

    function fundUsdc(uint256 amount) external onlyOwner {
        require(address(usdc) != address(0), "USDC not set");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
    }

    function fundUsdt(uint256 amount) external onlyOwner {
        require(address(usdt) != address(0), "USDT not set");
        usdt.safeTransferFrom(msg.sender, address(this), amount);
    }

    function claimPlayReward(uint256 amount) external nonReentrant {
        require(demoMode, "Rewards claim disabled");
        require(amount > 0 && amount <= 100 ether, "Amount out of range");
        token.mint(msg.sender, amount);
        emit RewardsClaimed(msg.sender, amount);
    }

    function stakedBalance(address user) external view returns (uint256) {
        return staked[user];
    }

    function usdcLiquidity() external view returns (uint256) {
        if (address(usdc) == address(0)) return 0;
        return usdc.balanceOf(address(this));
    }

    function usdtLiquidity() external view returns (uint256) {
        if (address(usdt) == address(0)) return 0;
        return usdt.balanceOf(address(this));
    }
}
