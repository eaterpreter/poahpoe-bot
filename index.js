const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const poahpoe = require('./modules/poahpoe');

// ✅ 指定只能在這個頻道使用 bot 功能
const ALLOWED_CHANNELS = [
  '851389863814234113',     // 聊天頻道
  '1325246375813840998'     // 開汝金口頻道
];


client.once('ready', () => {
  console.log(`🧿 poahpoe-bot 上線！${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  // 可選：限制按鈕只能在指定頻道互動（如果你希望更嚴格）
  if (!ALLOWED_CHANNELS.includes(interaction.channelId)) {
    return await interaction.reply({ content: '⚠️ 請到指定頻道使用跋桮功能 🙏', ephemeral: true });
  }

  if (interaction.isButton()) {
    await poahpoe.handleButton(interaction);
  }
});

client.on(Events.MessageCreate, async message => {
  if (!ALLOWED_CHANNELS.includes(message.channel.id)) return;

  if (message.content === '!pp') {
    await poahpoe.start(message);
  }
});

client.login(process.env.TOKEN);

