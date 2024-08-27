import { ethers } from "ethers";

export const validateContractAddress = (address) => {
  return !!address && ethers.isAddress(address);
};

export const validateTokenId = (id) => {
  return !!id && /^\d+$/.test(id);
};
