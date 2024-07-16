import Axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.TREASURE_API_URL;
const headers = {
  'X-API-Key': process.env.TREASURE_API_KEY,
};

export interface TreasureTagResponse {
  twitter: string;
  preferredDomainType: string;
  ens: string;
  treasuretag: TreasureTag;
  address: string;
  discord: string;
  smol: string;
  cacheLastModified: string;
}

export interface TreasureTag {
  domainType: string;
  name: string;
  pfp: string;
  banner: string;
}

export async function getTreasureTag(
  address: string
): Promise<TreasureTagResponse> {
  const response = await Axios.create({
    headers: headers,
    baseURL: `${BASE_URL}/domain/${address}`,
  }).get('');

  return response.data;
}

export async function getBatchTreasureTags(
  addresses: string[]
): Promise<TreasureTagResponse[]> {
  const response = await Axios.create({
    headers: headers,
    baseURL: `${BASE_URL}/batch-domains`,
  }).post('', { addresses: addresses });

  return response.data;
}