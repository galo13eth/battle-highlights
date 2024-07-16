import { BigNumberish, formatEther } from 'ethers';

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function shortenAddress (address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const toFixedNumber = (
  num: BigNumberish,
  precision?: number
): string => {
  precision = precision ? precision : 2;

  return parseFloat(formatEther(num.toString())).toFixed(
    precision
  );
};

export function ordinalSuffixOf(num: number) {
  let j = num % 10,
      k = num % 100;
  if (j == 1 && k != 11) {
    return num + "st";
  }
  if (j == 2 && k != 12) {
    return num + "nd";
  }
  if (j == 3 && k != 13) {
    return num + "rd";
  }
  return num + "th";
}