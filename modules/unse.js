const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// 運勢種類
const omikuji = [
  { name: '大吉', filename: 'taikiat.png' },
  { name: '小吉', filename: 'siokiat.png' },
  { name: '平', filename: 'penn.png' },
  { name: '小凶', filename: 'siohiong.png' },
  { name: '大凶', filename: 'taihiong.png' }
];

// 隨機抽運勢
function unse() {
  const idx = Math.floor(Math.random() * omikuji.length);
  return omikuji[idx];
}

// 按鈕組
function unseButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('reroll_us')
      .setLabel('繼續問')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('end_us')
      .setLabel('問完了')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  // !us 指令進入點
  start: async (message) => {
    await message.channel.send({
      content: `先想你要問的事情，準備好了再抽運勢`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('draw_us')
            .setLabel('開始！')
            .setStyle(ButtonStyle.Success)
        )
      ]
    });
  },

  // 按鈕互動
  handleButton: async (interaction) => {
    if (interaction.customId === 'draw_us' || interaction.customId === 'reroll_us') {
      const luck = unse();
      await interaction.reply({
        content: `${interaction.user} 抽到「${luck.name}」`,
        // 如果要加圖片：files: [ { attachment: `./assets/unse/${luck.filename}`, name: luck.filename } ],
        components: [unseButtonRow()]
      });
      return true;
    }
    if (interaction.customId === 'end_us') {
      await interaction.reply({
        content: `🧧 運勢抽籤結束！`,
        components: []
      });
      return true;
    }
    return false;
  }
};
