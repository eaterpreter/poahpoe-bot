const fs = require('fs');
const path = './state.json';

const choices = [
  { type: 'seng', image: 'sengpoe.png', label: '🟢 聖桮！' },
  { type: 'chhio', image: 'chhiopoe.png', label: '🟡 笑桮！' },
  { type: 'im', image: 'impoe.png', label: '⚫ 陰桮…' }
];

function getUserState(userId) {
  const state = JSON.parse(fs.readFileSync(path, 'utf8'));
  return state[userId] || { count: 0 };
}

function updateUserState(userId, result) {
  const state = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (!state[userId]) state[userId] = { count: 0 };

  if (result === 'seng') {
    state[userId].count++;
  } else {
    state[userId].count = 0;
  }

  fs.writeFileSync(path, JSON.stringify(state));
  return state[userId].count;
}

module.exports = {
  start: async (message) => {
    await message.channel.send({
      content: `🙏 Discord 問事\n請默念姓名生辰願望，再按下按鈕開始跋桮\n\n例如：弟子 XXX，OO年X月初X生，家住 OO，現有 OO 問題，請賜我聖桮 / 三聖桮。`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: '開始跋桮！',
              style: 1,
              custom_id: 'start_poahpoe'
            }
          ]
        }
      ]
    });
  },

  handleButton: async (interaction) => {
    if (interaction.customId === 'start_poahpoe' || interaction.customId === 'reroll_poahpoe') {
      const result = choices[Math.floor(Math.random() * choices.length)];
      const count = updateUserState(interaction.user.id, result.type);

      let extraText = '';

if (result.type === 'seng') {
  if (count === 1) {
    extraText = `${interaction.user.toString()} 獲得 🟢 聖桮！`;
  } else {
    extraText = `${interaction.user.toString()} 獲得 [${count}個]🟢 聖桮！`;
    if (count === 3) {
      extraText += `\n🎉 三聖桮完成！神明應允！`;
    }
  }
} else {
  extraText = `${interaction.user.toString()} 獲得 ${result.label}`;
}


      await interaction.reply({
        content: extraText,
        files: [`./assets/${result.image}`],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: '再跋一次',
                style: 1,
                custom_id: 'reroll_poahpoe'
              },
              {
                type: 2,
                label: '結束跋桮',
                style: 2,
                custom_id: 'end_poahpoe'
              }
            ]
          }
        ]
      });
    } else if (interaction.customId === 'end_poahpoe') {
      await interaction.reply({
        content: '🙏 跋桮已結束，感謝神明指示。\n若心意誠正，自會得明示，祝您平安順利。',
        ephemeral: true
      });
    }
  }
};

