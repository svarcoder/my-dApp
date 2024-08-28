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

const convertIPFSToHTTP = (url) => {
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return url;
};

// Function to fetch NFT transactions from Etherscan API
const BITQUERY_API_URL = "https://streaming.bitquery.io/graphql";

export const fetchNFTData = async (contractAddress, tokenId) => {
  const query = `
    query MyQuery {
      EVM(dataset: archive, network: eth) {
        Transfers(
          where: {Transfer: {Currency: {SmartContract: {is: "${contractAddress}"}}, Id: {eq: "${tokenId}"}}}
          limit: {count: 1, offset: 0}
          orderBy: {descending: Block_Number}
        ) {
          Transfer {
            Currency {
              SmartContract
              Name
              Decimals
              Fungible
              HasURI
              Symbol
            }
            Id
            URI
            Data
            owner: Receiver
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      BITQUERY_API_URL,
      { query },
      {
        headers: {
          "X-API-KEY": process.env.REACT_APP_BITQUERY_API_KEY,
          Authorization: `Bearer ${process.env.REACT_APP_BITQUERY_TOKEN_KEY}`,
        },
      }
    );
    const data = response.data.data;
    const metadataResponse = await axios.get(
      convertIPFSToHTTP(data?.EVM?.Transfers[0]?.Transfer?.URI)
    );

    const { image } = metadataResponse.data;
    const imageURL = convertIPFSToHTTP(image);

    if (data?.EVM?.Transfers[0]?.Transfer) {
      return {
        data: data?.EVM?.Transfers[0]?.Transfer,
        metadataResponse: imageURL,
      };
    } else {
      throw new Error("No data found");
    }
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
};
