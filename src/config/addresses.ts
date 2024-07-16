export const ADDRESSES = {
  AoV: '0x747910B74D2651A06563C3182838EAE4120F4277',
  Smol: '0xA7f1462e0EcdeEbDeE4FaF6681148Ca96Db78777',
  TalesHero: '0x7480224eC2B98f28cEe3740c80940A2F489BF352'
};

export const INVERTED_ADDRESSES = Object.entries(ADDRESSES).reduce((obj, [key, value]) => {
  obj[value] = key;
  return obj;
}, {} as Record<string, string>);