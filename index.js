const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
require('dotenv').config();
console.log('[debug] taua 檔案內容', require('fs').readFileSync('./modules/taua.js', 'utf-8'));


const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const poahpoe = require('./modules/poahpoe');
const hoahkun = require('./modules/hoahkun');
const taua = require('./modules/taua');
const thiuchhiam = require('./modules/thiuchhiam');
const lenormand = require('./modules/lenormand');
const unse = require('./modules/unse');

// ✅ 指定只能在這個頻道使用 bot 功能
const ALLOWED_CHANNELS = [
  '851389863814234113',     // 聊天頻道
  '1325246375813840998'     // 開汝金口頻道
];

client.once('ready', () => {
  console.log(`🧿 poahpoe-bot 上線！${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!ALLOWED_CHANNELS.includes(interaction.channelId)) {
    return await interaction.reply({ content: '⚠️ 請到指定頻道使用跋桮功能 🙏', ephemeral: true });
  }
  if (interaction.isButton()) {
    // 依序給每個模組檢查
    // 加入除錯訊息
    // 只要有一個模組 return true 就結束
    if (await poahpoe.handleButton(interaction)) {
      console.log('poahpoe handleButton 處理了這次 interaction');
      return;
    }
    if (await hoahkun.handleButton(interaction)) {
      console.log('hoahkun handleButton 處理了這次 interaction');
      return;
    }
    if (await taua.handleButton(interaction)) {
      console.log('taua handleButton 處理了這次 interaction');
      return;
    }
    if (await thiuchhiam.handleButton(interaction)) {
      console.log('thiuchhiam handleButton 處理了這次 interaction');
      return;
    }
    if (await lenormand.handleButton(interaction)) {
      console.log('lenormand handleButton 處理了這次 interaction');
      return;
    }
    if (await unse.handleButton(interaction)) {
      console.log('unse handleButton 處理了這次 interaction');
      return;
    }
    // 如果沒有模組處理
    console.log('沒有任何模組處理這次 interaction', interaction.customId);
  }
});

client.on(Events.MessageCreate, async message => {
  if (!ALLOWED_CHANNELS.includes(message.channel.id)) return;

  // 除錯追蹤，看到收到什麼訊息、頻道 ID
  console.log(`[Bot偵測] 收到訊息:`, message.content, 'from channel:', message.channel.id);

  const content = message.content.trim().toLowerCase();

  try {
    if (content === '!pp') {
      console.log('觸發 poahpoe start');
      await poahpoe.start(message);
    } else if (content === '!hk') {
      console.log('觸發 hoahkun start');
      await hoahkun.start(message);
    } else if (content === '!ta') {
      console.log('觸發 taua start');
      await taua.start(message);
    } else if (content === '!tc') {
      console.log('觸發 thiuchhiam start');
      await thiuchhiam.start(message);
    } else if (content === '!lc') {
      console.log('觸發 lenormand start');
      await lenormand.start(message);
    } else if (content === '!us') {
      console.log('觸發 unse start');
      await unse.start(message);
    }
  } catch (err) {
    console.error('[Bot執行時發生錯誤]', err);
    await message.channel.send('⚠️ 機器人執行時發生錯誤，請通知管理員！');
  }
});

client.login(process.env.TOKEN);
