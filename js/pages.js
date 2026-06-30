// MD1usd Configuration
const MD1USD_TOKEN_ADDRESS = '0x6bd6A380903Ae072A764A929C34779824c068BB1';
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

const RPCS = [
  'https://polygon-rpc.com',
  'https://rpc.ankr.com/polygon',
  'https://polygon.llamarpc.com'
];

// Initialize Contract Address Display
function initializeContractDisplay() {
  const contractAddr = document.getElementById('contractAddr');
  const polygonscanLink = document.getElementById('polygonscanLink');

  if (contractAddr) {
    contractAddr.textContent = MD1USD_TOKEN_ADDRESS;
  }

  if (polygonscanLink) {
    polygonscanLink.href = `https://polygonscan.com/token/${MD1USD_TOKEN_ADDRESS}`;
    polygonscanLink.textContent = `polygonscan.com/token/${MD1USD_TOKEN_ADDRESS} ↗`;
  }
}

initializeContractDisplay();

// RPC Provider Management
async function getWorkingProvider() {
  for (const rpc of RPCS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      await provider.getBlockNumber();
      return provider;
    } catch (e) {
      continue;
    }
  }
  throw new Error('All RPC providers failed');
}

// Load Vault Statistics
async function loadVaultStats() {
  try {
    const SUPPLY_DECIMALS = 18;
    const USDC_DECIMALS = 6;

    const MD1_ABI = ['function totalSupply() view returns (uint256)'];
    const USDC_ABI = ['function balanceOf(address) view returns (uint256)'];

    if (typeof ethers === 'undefined') {
      showStatsError(true);
      return;
    }

    const provider = await getWorkingProvider();

    // Read total supply from MD1usd token contract
    const tokenContract = new ethers.Contract(
      MD1USD_TOKEN_ADDRESS,
      MD1_ABI,
      provider
    );

    // Read collateral from USDC balance in MD1usd contract
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      USDC_ABI,
      provider
    );

    const [supply, collateral] = await Promise.all([
      tokenContract.totalSupply(),
      usdcContract.balanceOf(MD1USD_TOKEN_ADDRESS)
    ]);

    const supplyNum = ethers.formatUnits(supply, SUPPLY_DECIMALS);
    const collateralNum = ethers.formatUnits(collateral, USDC_DECIMALS);

    // Calculate collateralization ratio
    const collateralNormalized = collateral * 1000000000000n;
    const ratio =
      supply > 0n
        ? (Number((collateralNormalized * 10000n) / supply) / 100).toFixed(1) +
          '%'
        : 'N/A';

    // Update DOM
    const statSupply = document.getElementById('statSupply');
    const statCollateral = document.getElementById('statCollateral');
    const statRatio = document.getElementById('statRatio');
    const statSynced = document.getElementById('statSynced');

    if (statSupply) {
      statSupply.textContent =
        Number(supplyNum).toLocaleString() + ' MD1usd';
    }
    if (statCollateral) {
      statCollateral.textContent = '$' + Number(collateralNum).toLocaleString();
    }
    if (statRatio) {
      statRatio.textContent = ratio;
    }
    if (statSynced) {
      statSynced.textContent = new Date().toLocaleTimeString();
    }

    showStatsError(false);
    retryDelay = 60000;
  } catch (err) {
    console.error('Vault read failed:', err);
    showStatsError(true);
    retryDelay = Math.min(retryDelay * 1.5, MAX_RETRY);
  }
}

// Error Handling
const MIN_RETRY = 5000;
const MAX_RETRY = 60000;
let retryDelay = MIN_RETRY;

function showStatsError(show) {
  const el = document.getElementById('statsError');
  if (el) {
    if (show) {
      el.classList.add('show');
    } else {
      el.classList.remove('show');
    }
  }
}

// Schedule Stats Updates
async function scheduleStats() {
  await loadVaultStats();
  setTimeout(scheduleStats, retryDelay);
}

// Start stats loading after 2 seconds
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(scheduleStats, 2000);
  });
} else {
  setTimeout(scheduleStats, 2000);
}
