import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { Adventurer } from '../types/Adventurer.js';
import { shortenAddress, toFixedNumber, ordinalSuffixOf } from './util.js';
import { getTreasureTag, getBatchTreasureTags, TreasureTagResponse } from './treasureTags.js';
import { EmbedData } from './messaging.js';
import { COLORS } from '../config/colors.js';
import { ADDRESSES } from '../config/addresses.js';
import { Leaderboard } from '../types/Leaderboard.js';
import { getSmolTokenURI } from './blockchain.js';
import { svgToPng } from './svg.js';
import axios from 'axios';

const leaderboardThumbnail = new AttachmentBuilder('assets/leaderboard_yellow.png', { name: "leaderboardThumbnail.png" });
const arrowUpThumbnail = new AttachmentBuilder('assets/arrow_up.png', { name: "arrowUpThumbnail.png" });

export const createEmbedLeaderboardMessages = async (adventurers: Adventurer[], leaderboard: string, leaderboardType: string, itemsPerEmbed = 25): Promise<any> => {
  const embedBuilders: EmbedBuilder[] = [];
  const totalEmbeds = Math.ceil(adventurers.length / itemsPerEmbed);

  // Fetch treasure tags for all adventurers
  const addresses = [...new Set(adventurers.map(adventurer => adventurer.owner))];
  const treasureTags: TreasureTagResponse[] = await getBatchTreasureTags(addresses);

  for (let i = 0; i < totalEmbeds; i++) {
    const startIndex = i * itemsPerEmbed;
    const endIndex = startIndex + itemsPerEmbed;
    const adventurersSlice = adventurers.slice(startIndex, endIndex);

    const embed = new EmbedBuilder()
      .setColor(COLORS.YELLOW)
      .setTitle(`Top 50 ${leaderboardType ? `${leaderboardType}s` : 'Adventurers'} by ${leaderboard}`)
      .setImage('attachment://aovImage.jpeg')
      .setURL('https://app.rlm.land/adventurers/leaderboards')
      .setDescription(`The top ${itemsPerEmbed} ${leaderboardType ? `${leaderboardType}s` : 'adventurers'} by ${leaderboard}`)
      .setTimestamp()
      .setFooter({
        text: 'Powered by Realm Leaderboards Bot'
      });

    adventurersSlice.forEach((adventurer, index) => {
      const adventurerIndex = startIndex + index + 1;
      
      let value = adventurer[leaderboard as keyof Adventurer];
      if (leaderboard == 'animaEarned' || leaderboard == 'biggestAnimaWin') {
        value = toFixedNumber(value as string);
      }

      // Check if a treasure tag exists for the adventurer's address
      const treasureTag = treasureTags.find(tag => tag.address === adventurer.owner);
      const ownerDisplay = (treasureTag && treasureTag.treasuretag) ? `✨${treasureTag.treasuretag.name}` : shortenAddress(adventurer.owner);

      embed.addFields({
        name: `#${adventurerIndex} - ${leaderboardType ? `${leaderboardType}` : 'Adventurer'} #${adventurer.tokenId}`,
        value: `Owner: ${ownerDisplay}\n${leaderboard}: ${value}`
      });
    });

    embedBuilders.push(embed);
  }

  return embedBuilders;
}

export const createEmbedForNewEntry = async (adventurer: Adventurer, leaderboard: Leaderboard, newRanking: number, type?: string): Promise<EmbedData> => {
  const [aovImage, fileName] = await createAttachmentBuilder(adventurer);

  const embed = new EmbedBuilder()
    .setColor(COLORS.YELLOW)
    .setTitle(`New ${leaderboard.name} ${type || ''} Leaderboard Entry`)
    .setURL('https://app.rlm.land/adventurers/leaderboards')
    .setDescription(`${type || 'Adventurer'} #${adventurer.tokenId} claims the ${ordinalSuffixOf(newRanking + 1)} spot in the ${leaderboard.name} ${type || ''} Leaderboard!`)
    .setImage(`attachment://${fileName}`)
    .setThumbnail('attachment://leaderboardThumbnail.png')
    .setTimestamp()
      .setFooter({
        text: 'Powered by Realm Leaderboards Bot'
  });

  let value = adventurer[leaderboard.graphqlProp as keyof Adventurer];
  //if (leaderboard.graphqlProp == 'animaEarned' || leaderboard.graphqlProp == 'biggestAnimaWin') {
    value = toFixedNumber(value as string);
  //}

  // Check if a treasure tag exists for the adventurer's address
  const treasureTag: TreasureTagResponse = await getTreasureTag(adventurer.owner);
  const ownerDisplay = (treasureTag && treasureTag.treasuretag) ? `✨${treasureTag.treasuretag.name}` : shortenAddress(adventurer.owner);

  embed.addFields(
    {
      name: `Owner`,
      value: `${ownerDisplay}`,
      inline: false
    },
    {
      name: `${type || 'Adventurer'}`,
      value: `#${adventurer.tokenId}`,
      inline: true
    },
    {
      name: `Level`,
      value: `${adventurer.level}`,
      inline: true
    },
    {
      name: `XP`,
      value: `${adventurer.xp}`,
      inline: true
    },
    {
      name: `Battles`,
      value: `${adventurer.battles}`,
      inline: true
    },
    {
      name: `Points`,
      value: `${value}`,
      inline: true
    },
    {
      name: `Ranking`,
      value: `${ordinalSuffixOf(newRanking + 1)}`,
      inline: true
    }
  );

  return (
    {
      embedMessage: embed,
      attachments: [leaderboardThumbnail, aovImage]
    }
  );
}

export const createEmbedForPositionChange = async (adventurer: Adventurer, leaderboard: Leaderboard, oldIndex: number, newIndex: number, type?: string): Promise<EmbedData> => {
  const [aovImage, fileName] = await createAttachmentBuilder(adventurer);
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.YELLOW)
    .setTitle(`New ${leaderboard.name} ${type || ''} Leaderboard Position`)
    .setURL('https://app.rlm.land/adventurers/leaderboards')
    .setDescription(`${type || 'Adventurer'} #${adventurer.tokenId} has climbed from ${ordinalSuffixOf(oldIndex + 1)} to ${ordinalSuffixOf(newIndex + 1)} in the ${leaderboard.name} ${type || ''} Leaderboard!`)
    .setImage(`attachment://${fileName}`)
    .setThumbnail('attachment://arrowUpThumbnail.png')
    .setTimestamp()
      .setFooter({
        text: 'Powered by Realm Leaderboards Bot'
  });

  let value = adventurer[leaderboard.graphqlProp as keyof Adventurer];
  //if (leaderboard.graphqlProp == 'animaEarned' || leaderboard.graphqlProp == 'biggestAnimaWin') {
    value = toFixedNumber(value as string);
  //}

  // Check if a treasure tag exists for the adventurer's address
  const treasureTag: TreasureTagResponse = await getTreasureTag(adventurer.owner);
  const ownerDisplay = (treasureTag && treasureTag.treasuretag) ? `✨${treasureTag.treasuretag.name}` : shortenAddress(adventurer.owner);

  embed.addFields(
    {
      name: `Owner`,
      value: `${ownerDisplay}`,
      inline: false
    },
    {
      name: `${type || 'Adventurer'}`,
      value: `#${adventurer.tokenId}`,
      inline: true
    },
    {
      name: `Level`,
      value: `${adventurer.level}`,
      inline: true
    },
    {
      name: `XP`,
      value: `${adventurer.xp}`,
      inline: true
    },
    {
      name: `Battles`,
      value: `${adventurer.battles}`,
      inline: true
    },
    {
      name: `Points`,
      value: `${value}`,
      inline: true
    },
    {
      name: `Ranking`,
      value: `${ordinalSuffixOf(newIndex + 1)}`,
      inline: true
    }
  );

  return (
    {
      embedMessage: embed,
      attachments: [arrowUpThumbnail, aovImage]
    }
  );
}

export const createEmbedForNewDropOut = async (adventurer: Adventurer, leaderboard: Leaderboard, oldRanking: number, type?: string): Promise<EmbedData> => {
  const [aovImage, fileName] = await createAttachmentBuilder(adventurer);

  const embed = new EmbedBuilder()
    .setColor(COLORS.YELLOW)
    .setTitle(`New Win Streak Leaderboard Drop Out`)
    .setURL('https://app.rlm.land/adventurers/leaderboards')
    .setDescription(`${type || 'Adventurer'} #${adventurer.tokenId} was knocked off the Win Streak Leaderboard from the ${ordinalSuffixOf(oldRanking + 1)} spot!`)
    .setImage(`attachment://${fileName}`)
    .setThumbnail('attachment://leaderboardThumbnail.png')
    .setTimestamp()
      .setFooter({
        text: 'Powered by Realm Leaderboards Bot'
  });

  let value = adventurer['winStreak'];
  value = toFixedNumber(value as string);

  // Check if a treasure tag exists for the adventurer's address
  const treasureTag: TreasureTagResponse = await getTreasureTag(adventurer.owner);
  const ownerDisplay = (treasureTag && treasureTag.treasuretag) ? `✨${treasureTag.treasuretag.name}` : shortenAddress(adventurer.owner);

  embed.addFields(
    {
      name: `Owner`,
      value: `${ownerDisplay}`,
      inline: false
    },
    {
      name: `${type || 'Adventurer'}`,
      value: `#${adventurer.tokenId}`,
      inline: true
    },
    {
      name: `Level`,
      value: `${adventurer.level}`,
      inline: true
    },
    {
      name: `XP`,
      value: `${adventurer.xp}`,
      inline: true
    },
    {
      name: `Battles`,
      value: `${adventurer.battles}`,
      inline: true
    },
    {
      name: `Points`,
      value: `${value}`,
      inline: true
    },
  );

  return (
    {
      embedMessage: embed,
      attachments: [leaderboardThumbnail, aovImage]
    }
  );
}


const createAttachmentBuilder = async (adventurer: Adventurer): Promise<[AttachmentBuilder, string]> => {
  let aovImage: AttachmentBuilder;
  let fileName: string = 'aovImage.jpeg';

  try {
    if (adventurer.address.toLowerCase() == ADDRESSES.Smol.toLowerCase()) {
      fileName = "smolImage.png";
      
      // Fetch and decode data from the blockchain
      const data = await getSmolTokenURI(adventurer.tokenId);
      const decodedData = JSON.parse(atob(data.split(',')[1]));
      const base64Image = decodedData.image;

      // Decode the base64 image data
      const decodedImage = atob(base64Image.split(',')[1]);

      // Convert SVG to a format that can be used with AttachmentBuilder
      const pngBuffer = await svgToPng(decodedImage);

      aovImage = new AttachmentBuilder(pngBuffer, { name: fileName });
    }
    else if (adventurer.address.toLowerCase() == ADDRESSES.TalesHero.toLowerCase()) {
      fileName = "talesHeroImage.gif";

      const response = await axios.get(`${process.env.TALES_OF_ELLERIA_API_URL}/hero/${adventurer.tokenId}`);
      const imageUrl = response.data.image;
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      aovImage = new AttachmentBuilder(Buffer.from(imageResponse.data, 'binary'), { name: fileName });
    }
    else {
      aovImage = adventurer.archetype != '0' ? new AttachmentBuilder(`assets/adventurers/${adventurer.archetype}.jpeg`, { name: fileName }) : new AttachmentBuilder(`assets/adventurers/placeholder.jpeg`, { name: fileName });
    }
  } catch (error) {
    console.error(error);
    aovImage = new AttachmentBuilder(`assets/adventurers/placeholder.jpeg`, { name: fileName });
  }

  return [aovImage, fileName];
}