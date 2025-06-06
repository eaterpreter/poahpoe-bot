// modules/taua.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  // !ta 指令進入點
  start: async (message) => {
    const point = rollDice();
    await message.channel.send({
      content: `${message.author} 抽到 ${point.emoji} ${point.num} 點！`,
      components: [diceButtonRow()]
    });
  },

  // 按鈕互動
  handleButton: async (interaction) => {
    // 只處理骰子 customId
    if (!(interaction.customId === 'reroll_ta' || interaction.customId === 'end_ta')) return false;

    if (interaction.customId === 'reroll_ta') {
      const point = rollDice();
      await interaction.reply({
        content: `${interaction.user} 抽到 ${point.emoji} ${point.num} 點！`,
        components: [diceButtonRow()]
      });
      return true;
    }

    if (interaction.customId === 'end_ta') {
      await interaction.update({
        content: `🎲 丟骰子結束！`,
        components: []
      });
      return true;
    }

    return false;
  }
};

// 工具：骰子隨機點數（1～6）
function rollDice() {
  const num = Math.floor(Math.random() * 6) + 1;
  const emoji = ['①', '②', '③', '④', '⑤', '⑥'][num - 1]; // 你也可以改成 🎲, ⚀, ⚁, ...
  return { num, emoji };
}

// 工具：按鈕組
function diceButtonRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('reroll_ta')
      .setLabel('繼續丟骰子')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('end_ta')
      .setLabel('不玩了啦')
      .setStyle(ButtonStyle.Secondary)
  );
}
