const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// 1. 牌組資料
const cards = [
  { name: '騎士 Rider' },
  { name: '四葉草 Clover' },
  { name: '船 Ship' },
  { name: '房屋 House' },
  { name: '樹 Tree' },
  { name: '雲 Cloud' },
  { name: '蛇 Snake' },
  { name: '棺木 Coffin' },
  { name: '花束 Bouquet' },
  { name: '鐮刀 Scythe' },
  { name: '鞭子 Whip' },
  { name: '鳥 Birds' },
  { name: '小孩 Child' },
  { name: '狐狸 Fox' },
  { name: '熊 Bear' },
  { name: '星星 Stars' },
  { name: '鸛 Stork' },
  { name: '小狗 Dog' },
  { name: '塔 Tower' },
  { name: '公園 Garden' },
  { name: '山 Mountain' },
  { name: '分岔路 Crossroad' },
  { name: '老鼠 Mice' },
  { name: '心 Heart' },
  { name: '戒指 Ring' },
  { name: '書 Book' },
  { name: '信件 Letter' },
  { name: '男人 Gentleman' },
  { name: '女人 Lady' },
  { name: '百合花 Lily' },
  { name: '太陽 Sun' },
  { name: '月亮 Moon' },
  { name: '鑰匙 Key' },
  { name: '魚 Fish' },
  { name: '船錨 Anchor' },
  { name: '十字架 Cross' }
];

// 工具：隨機抽一張牌
function drawCard() {
  const idx = Math.floor(Math.random() * cards.length);
  return cards[idx];
}

// 工具：按鈕組
function cardButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('reroll_lc')
      .setLabel('繼續抽牌')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('end_lc')
      .setLabel('抽牌結束')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  // !lc 指令進入點
  start: async (message) => {
    await message.channel.send({
      content: `歡迎來雷諾曼卡，準備好抽牌了嗎？`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('draw_lc')
            .setLabel('開始抽牌')
            .setStyle(ButtonStyle.Success)
        )
      ]
    });
  },

  // 按鈕互動
  handleButton: async (interaction) => {
    if (interaction.customId === 'draw_lc' || interaction.customId === 'reroll_lc') {
      const card = drawCard();
      await interaction.reply({
        content: `${interaction.user} 抽到 ${card.name}`,
        // 圖片等下加，先純文字
        // files: [ { attachment: `./assets/lenormand/${card.filename}`, name: card.filename } ],
        components: [cardButtonRow()]
      });
      return true;
    }
    if (interaction.customId === 'end_lc') {
      await interaction.reply({
        content: `🔮 抽牌結束！`,
        components: []
      });
      return true;
    }
    return false;
  }
};
