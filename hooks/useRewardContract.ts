import ERC20_ABI from "../contracts/ERC20.json";
import type { Reward } from "../contracts/types";
import useContract from "./useContract";

export default function useRewardContract(tokenAddress?: string) {
  return useContract<Reward>(tokenAddress, ERC20_ABI);
}
