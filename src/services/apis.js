import axios from "axios";
import { ethers } from "ethers";

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
export const getNFTMetadata = async (contractAddress, tokenId) => {
  try {
    const provider = new ethers.JsonRpcProvider(
      `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHYME_KEY}`
    );

    const abi = [
      "function tokenURI(uint256 _tokenId) external view returns (string memory)",
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);

    const tokenURI = await contract.tokenURI(tokenId);

    const metadataURL = convertIPFSToHTTP(tokenURI);

    const metadataResponse = await axios.get(metadataURL);

    const { name, description, image } = metadataResponse.data;

    const imageURL = convertIPFSToHTTP(image);

    return {
      name,
      description,
      image: imageURL,
    };
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    throw error;
  }
};

export const checkTokenType = async (contractAddress) => {
  const ERC721_INTERFACE_ID = "0x80ac58cd";
  const ERC1155_INTERFACE_ID = "0xd9b67a26";

  const provider = new ethers.JsonRpcProvider(
    `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHYME_KEY}`
  );
  const contract = new ethers.Contract(
    contractAddress,
    [
      "function supportsInterface(bytes4 interfaceID) external view returns (bool)",
    ],
    provider
  );

  try {
    const isERC721 = await contract.supportsInterface(ERC721_INTERFACE_ID);
    if (isERC721) {
      return "ERC-721";
    }

    const isERC1155 = await contract.supportsInterface(ERC1155_INTERFACE_ID);
    if (isERC1155) {
      return "ERC-1155";
    }

    return "Unknown";
  } catch (error) {
    console.error("Error checking token type:", error);
    throw error;
  }
};
