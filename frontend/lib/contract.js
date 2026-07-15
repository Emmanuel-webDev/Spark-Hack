import abi from "./abi.json";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const CONTRACT_ABI = abi;

export const contract = {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
};
