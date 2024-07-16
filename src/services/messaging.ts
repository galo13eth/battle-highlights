import { EmbedBuilder, AttachmentBuilder, Client, TextChannel } from 'discord.js';
import { Pagination } from 'discordjs-button-embed-pagination';
import { sleep } from './util.js';

interface TextMessageData {
  type: 'text';
  content: string;
  targetChannelId: string;
}

export interface EmbedData {
  embedMessage: EmbedBuilder;
  attachments?: AttachmentBuilder[];
}

interface EmbedMessageData {
  type: 'embed';
  content: EmbedData;
  targetChannelId: string;
}

type MessageData = TextMessageData | EmbedMessageData;

var isSendingMessages = false;
var messageQueue: MessageData[] = [];
const MESSAGE_TIMEOUT = 2000;

export async function sendMessage(client: Client, targetChannelId: string, messageContent: any) {
  const targetChannel = await client.channels.fetch(targetChannelId);
  if (!targetChannel) {
    console.error(`Channel not found for ID: ${targetChannelId}`);
    return;
  }

  messageQueue.push({ type: 'text', content: messageContent, targetChannelId });
  if (isSendingMessages) return;
  await processQueue(client);
}

export async function sendEmbed(client: Client, targetChannelId: string, embedMessage: EmbedBuilder, attachments?: AttachmentBuilder[]) {
  const targetChannel = await client.channels.fetch(targetChannelId);
  if (!targetChannel) {
    console.error(`Channel not found for ID: ${targetChannelId}`);
    return;
  }

  const embedData: MessageData = { type: 'embed', content: { embedMessage, attachments }, targetChannelId };
  messageQueue.push(embedData);

  if (isSendingMessages) return;

  await processQueue(client);
}

async function processQueue(client: Client) {
  isSendingMessages = true;

  while (messageQueue.length > 0) {
    const messageData = messageQueue.shift();

    if (!messageData) {
      continue;
    }

    const targetChannel = await client.channels.fetch(messageData.targetChannelId) as TextChannel;

    if (messageData?.type === 'text') {
      await targetChannel?.send(messageData.content);
    } else if (messageData?.type === 'embed') {
      const { embedMessage, attachments } = messageData.content;
      await targetChannel?.send({ embeds: [embedMessage], files: attachments ? attachments : [] });
    }

    await sleep(MESSAGE_TIMEOUT);
  }

  isSendingMessages = false;
}

export async function sendPaginatedEmbeds(client: Client, targetChannelId: string, embeds: EmbedBuilder[]) {
  const targetChannel = await client.channels.fetch(targetChannelId) as TextChannel;
  if (!targetChannel) {
    console.error(`Channel not found for ID: ${targetChannelId}`);
    return;
  }

  await new Pagination(targetChannel, embeds, "page").paginate();
}