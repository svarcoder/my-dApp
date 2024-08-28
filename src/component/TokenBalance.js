import React, { useState, useMemo } from "react";
import axios from "axios";
import { fetchUSDPrices } from "../services/apis";
import {
  convertHexToEther,
  convertScientificToBigNumber,
  isScientificNotation,
  validateContractAddress,
} from "./ValidationFn";

const TokenBalance = React.memo(() => {
  const [address, setAddress] = useState("");
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalUSDValue, setTotalUSDValue] = useState(0);
  const [isValid, setIsValid] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    setIsValid(validateContractAddress(value));
  };

  const publicRPCs = useMemo(
    () => ({
      ethereum: `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHYME_KEY}`,
      arbitrum: `https://arb-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHYME_KEY}`,
      optimism: `https://opt-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHYME_KEY}`,
      base: `https://base-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHYME_KEY}`,
    }),
    []
  );

  const tokenAddresses = useMemo(
    () => ({
      ethereum: {
        wETH: process.env.REACT_APP_ETH_WETH_ADDRESS,
        USDC: process.env.REACT_APP_ETH_USDC_ADDRESS,
        USDT: process.env.REACT_APP_ETH_USDT_ADDRESS,
      },
      arbitrum: {
        wETH: process.env.REACT_APP_ARB_WETH_ADDRESS,
        USDC: process.env.REACT_APP_ARB_USDC_ADDRESS,
        USDT: process.env.REACT_APP_ARB_USDT_ADDRESS,
      },
      optimism: {
        wETH: process.env.REACT_APP_OPT_WETH_ADDRESS,
        USDC: process.env.REACT_APP_OPT_USDC_ADDRESS,
        USDT: process.env.REACT_APP_OPT_USDT_ADDRESS,
      },
      base: {
        wETH: process.env.REACT_APP_BASE_WETH_ADDRESS,
        USDC: process.env.REACT_APP_BASE_USDC_ADDRESS,
        USDT: process.env.REACT_APP_BASE_USDT_ADDRESS,
      },
    }),
    []
  );

  const fetchBalances = async () => {
    if (!address || !isValid) return;

    setLoading(true);
    setError(null);
    setBalances([]);
    setTotalUSDValue(0);

    try {
      const usdPrices = await fetchUSDPrices();

      const tokenBalances = await Promise.all(
        Object.keys(publicRPCs).map(async (chain) => {
          const rpcUrl = publicRPCs[chain];
          const tokens = tokenAddresses[chain] || tokenAddresses["ethereum"];

          const ethBalanceResponse = await axios.post(rpcUrl, {
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1,
          });
          const ethBalanceHex = ethBalanceResponse.data.result;
          const ethBalanceInEther = convertHexToEther(ethBalanceHex).toString();
          const ethUSDValue = Number(ethBalanceInEther) * Number(usdPrices.ETH);

          const tokenBalances = await Promise.all(
            Object.keys(tokens).map(async (token) => {
              const tokenContract = tokens[token];

              const tokenBalanceResponse = await axios.post(rpcUrl, {
                jsonrpc: "2.0",
                method: "eth_call",
                params: [
                  {
                    to: tokenContract,
                    data: `0x70a08231${address.slice(2).padStart(64, "0")}`,
                  },
                  "latest",
                ],
                id: 1,
              });

              const tokenBalanceHex = tokenBalanceResponse.data.result;
              const tokenBalance =
                convertHexToEther(tokenBalanceHex).toString();
              const forCheckUSDC = isScientificNotation(tokenBalance)
                ? convertScientificToBigNumber(tokenBalance).toFixed()
                : tokenBalance;
              const tokenUSDValue =
                Number(forCheckUSDC) * Number(usdPrices[token]);

              return {
                symbol: token,
                balance: tokenBalance,
                usdValue: tokenUSDValue,
              };
            })
          );

          return {
            chain,
            ethBalance: ethBalanceInEther,
            ethUSDValue,
            tokenBalances,
          };
        })
      );

      let totalValue = 0;
      const result = tokenBalances.flatMap((chainData) => {
        const chainResults = [
          {
            chain: chainData.chain,
            symbol: "ETH",
            balance: chainData.ethBalance,
            usdValue: chainData.ethUSDValue,
          },
        ];

        totalValue += chainData.ethUSDValue;

        chainData.tokenBalances.forEach((token) => {
          chainResults.push({
            chain: chainData.chain,
            symbol: token.symbol,
            balance: token.balance,
            usdValue: token.usdValue,
          });

          totalValue += token.usdValue;
        });

        return chainResults;
      });

      const newResult =
        result.length > 0 && result.filter((item) => Number(item?.balance) > 0);

      setBalances(newResult);
      setTotalUSDValue(totalValue);
    } catch (error) {
      console.error("Error fetching balances:", error);
      setError("Failed to fetch balances. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setAddress("");
    setBalances([]);
    setError(null);
    setTotalUSDValue(0);
  };

  const totalUSDValueDisplay = useMemo(
    () => totalUSDValue.toFixed(2),
    [totalUSDValue]
  );

  const sortBalances = () => {
    const sortedBalances = [...balances].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.usdValue - b.usdValue;
      } else {
        return b.usdValue - a.usdValue;
      }
    });

    setBalances(sortedBalances);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <>
      <input
        type="text"
        placeholder="Enter Wallet Address"
        value={address}
        className={`form-control mb-4 ${isValid ? "" : "is-invalid"}`}
        onChange={handleChange}
      />
      {!isValid && <p className="text-danger">Invalid Ethereum address</p>}
      <button
        onClick={fetchBalances}
        disabled={loading}
        className="btn btn-light border border-primary rounded-pill text-primary py-2 px-4 me-4 mb-4"
      >
        {loading ? "Loading..." : "Get Balances"}
      </button>
      <button
        onClick={sortBalances}
        disabled={loading}
        className="btn btn-light border border-primary rounded-pill text-primary py-2 px-4 me-4 mb-4"
      >
        Sort USD ({sortOrder === "asc" ? "Ascending" : "Descending"})
      </button>
      <button
        onClick={clearData}
        disabled={loading}
        className="btn btn-light border border-primary rounded-pill text-primary py-2 px-4 me-4 mb-4"
      >
        Clear
      </button>
      {error && (
        <p style={{ color: "red" }} className="mb-4">
          {error}
        </p>
      )}
      <ul>
        {balances.map((b, index) => (
          <li key={index}>
            {String(b.chain).toUpperCase()} - {b.symbol}:{" "}
            {isScientificNotation(b.balance)
              ? convertScientificToBigNumber(b.balance).toFixed()
              : b.balance}{" "}
            - ${Number(b.usdValue).toFixed(5)}
          </li>
        ))}
      </ul>
      {balances.length > 0 && totalUSDValueDisplay > 0 && (
        <h3>Total USD Value: ${totalUSDValueDisplay}</h3>
      )}
    </>
  );
});

export default TokenBalance;
