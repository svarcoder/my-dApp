import axios from "axios";

// Function to fetch USD value for Coingeko
export const fetchUSDPrices = async () => {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: "ethereum,weth,usd-coin,tether",
        vs_currencies: "usd",
      },
    }
  );

  return {
    ETH: response.data.ethereum.usd,
    wETH: response.data["weth"].usd,
    USDC: response.data["usd-coin"].usd,
    USDT: response.data.tether.usd,
  };
};

// Function to fetch NFT transactions from Etherscan API
export const getNFTTransactions = async (contractAddress, tokenId) => {
  try {
    const response = await axios.get("https://api.etherscan.io/api", {
      params: {
        module: "account",
        action: "tokennfttx",
        contractaddress: contractAddress,
        tokenid: tokenId,
        apikey: process.env.REACT_APP_ETHERSCAN_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching NFT transactions:", error);
    throw error;
  }
};
