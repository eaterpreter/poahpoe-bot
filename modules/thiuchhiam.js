// modules/thiuchhiam.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 讀取60首籤詩
const poems = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'thiuchhiam.json'), 'utf8')
);

module.exports = {
  // !tc 指令進入點
  start: async (message) => {
    await message.channel.send({
      content: `要開始抽籤了嗎？`,
      components: [drawButtonRow()]
    });
  },

  // 按鈕互動
  handleButton: async (interaction) => {
    if (interaction.customId === 'start_draw_poem') {
      // 隨機抽一首
      const poem = poems[Math.floor(Math.random() * poems.length)];
      await interaction.reply({
        content: `${interaction.user} 抽到第 ${poem.id} 首：\n${poem.poem}\n\n【籤詩解】\n${poem.explain}`,
        components: [drawAgainButtonRow()]
      });
      return true;
    }
    if (interaction.customId === 'draw_again_poem') {
      const poem = poems[Math.floor(Math.random() * poems.length)];
      await interaction.update({
        content: `${interaction.user} 抽到第 ${poem.id} 首：\n${poem.poem}\n\n【籤詩解】\n${poem.explain}`,
        components: [drawAgainButtonRow()]
      });
      return true;
    }
    if (interaction.customId === 'end_draw_poem') {
      await interaction.reply({
        content: `🎴 抽籤結束！`,
        components: []
      });
      return true;
    }
    return false;
  }
};

// 按鈕組（第一次用：開始抽籤）
function drawButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('start_draw_poem')
      .setLabel('開始抽籤')
      .setStyle(ButtonStyle.Primary)
  );
}

// 抽出後的按鈕組：再抽一首、不玩了啦
function drawAgainButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('draw_again_poem')
      .setLabel('再抽一首')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('end_draw_poem')
      .setLabel('不玩了啦')
      .setStyle(ButtonStyle.Secondary)
  );
}
