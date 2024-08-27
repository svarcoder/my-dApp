import { ethers } from "ethers";
import BigNumber from "bignumber.js";

export const isScientificNotation = (value) => {
  return value.toString().includes("e") || value.toString().includes("E");
};

export const convertScientificToBigNumber = (scientificNotation) => {
  return new BigNumber(scientificNotation);
};

export const convertHexToEther = (hexValue) => {
  if (!hexValue || hexValue === "0x" || hexValue === "0x0") {
    return new BigNumber(0);
  }

  const decimalValue = new BigNumber(hexValue, 16);
  const weiToEtherConversion = new BigNumber(10).pow(18);
  return Number(decimalValue.div(weiToEtherConversion)).toString();
};

export const validateContractAddress = (address) => {
  return !!address && ethers.isAddress(address);
};

export const validateTokenId = (id) => {
  return !!id && /^\d+$/.test(id);
};
