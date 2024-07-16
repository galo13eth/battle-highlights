import { ethers } from 'ethers';
import retry from 'async-retry';
import { ADDRESSES } from '../config/addresses.js';
import smolABI from '../abis/Smols.json' assert { type: 'json' };

const provider = new ethers.JsonRpcProvider('https://arb-mainnet.g.alchemy.com/v2/HzCN_PDwyhg464A4hQDCEtx9GUsjhqdR');

// Initialize contracts
const smolContract = new ethers.Contract(ADDRESSES.Smol, smolABI, provider);

export const getSmolTokenURI = async (tokenId: string): Promise<string> => {
  return await retry(async () => {
    // if anything throws, we retry up to 5 times with exponential backoff
    return await smolContract.tokenURI(tokenId);
  }, {
    retries: 5,
    minTimeout: 1000,
    factor: 2,
  });
};