import React, { useState, useMemo } from "react";
import axios from "axios";
import { fetchUSDPrices } from "../services/apis";
import { validateContractAddress } from "./ValidationFn";

const TokenBalance = React.memo(() => {
  const [address, setAddress] = useState("");
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalUSDValue, setTotalUSDValue] = useState(0);
  const [isValid, setIsValid] = useState(true);

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
      wETH: process.env.REACT_APP_WETH_ADDRESS,
      USDC: process.env.REACT_APP_USDC_ADDRESS,
      USDT: process.env.REACT_APP_USDT_ADDRESS,
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

          const ethBalanceResponse = await axios.post(rpcUrl, {
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1,
          });

          const ethBalanceHex = ethBalanceResponse.data.result || "0x0";
          const ethBalanceInEther = parseInt(ethBalanceHex, 16) / 1e18;
          const ethUSDValue = ethBalanceInEther * usdPrices.ETH;

          const tokenBalances = await Promise.all(
            Object.keys(tokenAddresses).map(async (token) => {
              const tokenContract = tokenAddresses[token];
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

              const tokenBalanceHex = tokenBalanceResponse.data.result || "0x0";
              const tokenBalance = parseInt(tokenBalanceHex, 16) / 1e18;
              const tokenUSDValue = tokenBalance * usdPrices[token];

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

        chainData.tokenBalances
          .filter((token) => token.balance > 0)
          .forEach((token) => {
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

      setBalances(result);
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
            {String(b.chain).toUpperCase()} - {b.symbol}: {b.balance}
          </li>
        ))}
      </ul>
      {balances.length > 0 && totalUSDValue > 0 && (
        <h3>Total USD Value: ${totalUSDValueDisplay}</h3>
      )}
    </>
  );
});

export default TokenBalance;
