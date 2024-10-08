import React, { useState, useCallback, useMemo } from "react";
import { fetchNFTData } from "../services/apis";
import { validateContractAddress, validateTokenId } from "./ValidationFn";

const NFTDetails = React.memo(() => {
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [nftData, setNftData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState({
    contractAddress: true,
    tokenId: true,
  });

  const handleContractAddressChange = useCallback((e) => {
    const address = e.target.value;
    setContractAddress(address);
    setIsValid((prevIsValid) => ({
      ...prevIsValid,
      contractAddress: validateContractAddress(address),
    }));
  }, []);

  const handleTokenIdChange = useCallback((e) => {
    const id = e.target.value;
    setTokenId(id);
    setIsValid((prevIsValid) => ({
      ...prevIsValid,
      tokenId: validateTokenId(id),
    }));
  }, []);

  const canFetchDetails = useMemo(() => {
    return (
      contractAddress && tokenId && isValid.contractAddress && isValid.tokenId
    );
  }, [contractAddress, tokenId, isValid]);

  const fetchNFTDetails = useCallback(async () => {
    if (!canFetchDetails) return;

    setLoading(true);
    setError(null);
    setNftData(null);

    try {
      const details = await fetchNFTData(contractAddress, tokenId);

      if (!details) {
        throw new Error("NFT metadata not found or invalid inputs");
      }

      setNftData(details);
    } catch (err) {
      console.error("Error fetching NFT details:", err);
      setError("Failed to fetch NFT details. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  }, [canFetchDetails, contractAddress, tokenId]);

  return (
    <div className="hero-header overflow-hidden px-5">
      <div className="rotate-img">
        <div className="rotate-sty-2" />
      </div>

      <div className="row gy-5 align-items-center">
        <div className="col-lg-6 wow fadeInLeft" data-wow-delay="0.1s">
          <h2>Enter NFT Details</h2>
          <div className="col-lg-12 col-xl-6 mb-4">
            <input
              type="text"
              placeholder="Contract Address"
              className={`form-control ${
                !isValid.contractAddress ? "is-invalid" : ""
              }`}
              value={contractAddress}
              onChange={handleContractAddressChange}
            />
            {!isValid.contractAddress && (
              <p className="text-danger">Invalid contract address.</p>
            )}
          </div>
          <div className="col-lg-12 col-xl-6 mb-4">
            <input
              type="text"
              placeholder="Token ID"
              className={`form-control ${!isValid.tokenId ? "is-invalid" : ""}`}
              value={tokenId}
              onChange={handleTokenIdChange}
            />
            {!isValid.tokenId && (
              <p className="text-danger">Invalid Token ID.</p>
            )}
          </div>

          <button
            onClick={fetchNFTDetails}
            disabled={loading || !canFetchDetails}
            className="btn btn-light border border-primary rounded-pill text-primary py-2 px-4 me-4 mb-4"
          >
            {loading ? "Loading..." : "Get NFT Details"}
          </button>
          {error && (
            <p style={{ color: "red" }} className="mb-4">
              {error}
            </p>
          )}
        </div>

        <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.2s">
          {nftData?.data && (
            <div>
              <h3>
                {nftData?.data?.Currency?.Name}-
                {nftData?.data?.Currency?.Symbol}
              </h3>
              <p>{nftData?.data.owner}</p>
              <p>
                {nftData?.data?.Currency?.Fungible ? "ERC-1155" : "ERC-721"}
              </p>
              {nftData?.metadataResponse && (
                <div>
                  {nftData?.metadataResponse.endsWith(".mp4") ? (
                    <video src={nftData?.metadataResponse} controls />
                  ) : (
                    <img
                      src={nftData?.metadataResponse}
                      alt={nftData?.metadataResponse}
                      style={{ maxWidth: "300px" }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default NFTDetails;
