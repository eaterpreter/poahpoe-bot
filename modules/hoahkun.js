const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const CHOICES = [
  { name: '剪刀', emoji: '✌️', id: 'scissors' },
  { name: '石頭', emoji: '✊', id: 'rock' },
  { name: '布', emoji: '🖐️', id: 'paper' },
];

// ===== 全域 Session 狀態 =====
let session = null; // { startedBy, players: {id: {name, pick}}, phase: 'waiting'|'picking'|'showing' }

function getPlayerListText() {
  if (!session || !session.players || Object.keys(session.players).length === 0)
    return '（現在沒人）';
  return Object.values(session.players)
    .map(p => `<@${p.id}>`)
    .join('、');
}

module.exports = {
  // 處理 !hk
  start: async (message) => {
    if (session && session.phase !== 'showing') {
      await message.channel.send('⚠️ 大家正在玩，請等這局結束。');
      return;
    }
    session = {
      startedBy: message.author.id,
      players: {},
      phase: 'waiting',
      channelId: message.channel.id,
    };
    session.players[message.author.id] = { id: message.author.id, name: message.author.username, pick: null };

    await message.channel.send({
      content: `剪刀石頭布！\n [立刻加入] 或 [跟自己玩]。\n\n玩家：${getPlayerListText()}`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('join_hk').setLabel('立刻加入').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('solo_hk').setLabel('跟自己玩').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('start_hk').setLabel('開始出手').setStyle(ButtonStyle.Success)
            .setDisabled(false)
        )
      ]
    });
  },

  // 按鈕互動
  handleButton: async (interaction) => {
    // 只處理自己相關 customId
    if (
      !(
        interaction.customId === 'join_hk' ||
        interaction.customId === 'solo_hk' ||
        interaction.customId === 'start_hk' ||
        interaction.customId === 'next_hk' ||
        interaction.customId === 'end_hk' ||
        interaction.customId.startsWith('pick_hk_') ||
        interaction.customId.startsWith('solo_pick_hk_') ||
        interaction.customId.startsWith('solo_next_hk_')
      )
    ) return false;

    // 玩家加入
    if (interaction.customId === 'join_hk') {
      if (!session || session.phase !== 'waiting') {
        await interaction.reply({ content: '這局已經開始或結束，請重新輸入 !hk 重新玩！', ephemeral: true });
        return true;
      }
      if (!session.players[interaction.user.id]) {
        session.players[interaction.user.id] = { id: interaction.user.id, name: interaction.user.username, pick: null };
      }
      await interaction.update({
        content: `剪刀石頭布！\n [立刻加入] 或 [跟自己玩]。\n\n玩家：${getPlayerListText()}`,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_hk').setLabel('立刻加入').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('solo_hk').setLabel('跟自己玩').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('start_hk').setLabel('開始出手').setStyle(ButtonStyle.Success)
              .setDisabled(interaction.user.id !== session.startedBy)
          )
        ]
      });
      return true;
    }

    // 跟自己玩（單人模式）
    if (interaction.customId === 'solo_hk') {
      await sendSoloRound(interaction);
      return true;
    }

    // 多人開始出拳
    if (interaction.customId === 'start_hk') {
      if (!session || session.phase !== 'waiting') {
        await interaction.reply({ content: '這局已經開始或結束，請重新輸入 !hk 開新局！', ephemeral: true });
        return true;
      }
      if (interaction.user.id !== session.startedBy) {
        await interaction.reply({ content: '只有主持人能喊 [開始]！', ephemeral: true });
        return true;
      }
      session.phase = 'picking';
      for (const uid in session.players) session.players[uid].pick = null;

      await interaction.update({
        content: `所有玩家請點選下方「出拳」按鈕（只有自己選得見）：\n\n玩家：${getPlayerListText()}`,
        components: [choiceButtonRow(false)]
      });
      return true;
    }

    // 玩家出拳（多人）
    if (interaction.customId.startsWith('pick_hk_')) {
      if (!session || session.phase !== 'picking') {
        await interaction.reply({ content: '目前沒有人在猜拳，請重打 !hk。', ephemeral: true });
        return true;
      }
      if (!session.players[interaction.user.id]) {
        await interaction.reply({ content: '你不是這一局的玩家！', ephemeral: true });
        return true;
      }
      if (session.players[interaction.user.id].pick) {
        await interaction.reply({ content: '你已經出過了，請等大家都出完。', ephemeral: true });
        return true;
      }
      const pick = interaction.customId.replace('pick_hk_', '');
      session.players[interaction.user.id].pick = pick;
      await interaction.reply({ content: `你已選擇「${getChoiceName(pick)}」${getChoiceEmoji(pick)}！請等待其他玩家出拳。`, ephemeral: true });

      // 檢查是否全部玩家都已選
      if (Object.values(session.players).every(p => p.pick)) {
        session.phase = 'showing';
        await revealAll(interaction.channel);
      }
      return true;
    }

    // 多人下一局
    if (interaction.customId === 'next_hk') {
      if (!session || !session.players || Object.keys(session.players).length === 0) {
        await interaction.reply({ content: '請先輸入 !hk 重新玩。', ephemeral: true });
        return true;
      }
      session.phase = 'picking';
      for (const uid in session.players) session.players[uid].pick = null;
      await interaction.update({
        content: `新的一局開始，所有玩家請點選下方「出拳」！\n\n玩家：${getPlayerListText()}`,
        components: [choiceButtonRow(false)]
      });
      return true;
    }

    // 結束遊戲
    if (interaction.customId === 'end_hk') {
      session = null;
      await interaction.update({
        content: '遊戲結束！',
        components: []
      });
      return true;
    }

    // 單人模式下一局
    if (interaction.customId.startsWith('solo_next_hk_')) {
      await sendSoloRound(interaction, interaction.customId.split('_').pop());
      return true;
    }

    // 單人模式選拳
    if (interaction.customId.startsWith('solo_pick_hk_')) {
      const userPick = interaction.customId.replace('solo_pick_hk_', '');
      const botIndex = Math.floor(Math.random() * 3);
      const botPick = CHOICES[botIndex].id;
      const result = judgeWinner(userPick, botPick);
      let resultText;
      if (result === 'win') resultText = '你贏了！🎉';
      else if (result === 'lose') resultText = '你輸了 QQ';
      else resultText = '平手！';
      await interaction.update({
        content: `你選擇「${getChoiceName(userPick)}」${getChoiceEmoji(userPick)}\nBot 選擇「${getChoiceName(botPick)}」${getChoiceEmoji(botPick)}\n\n這局的輸贏為：**${resultText}**`,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`solo_next_hk_${userPick}`)
              .setLabel('下一局')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('end_hk')
              .setLabel('結束')
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      });
      return true;
    }

    return false;
  }
};

function choiceButtonRow(isSolo = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(isSolo ? 'solo_pick_hk_scissors' : 'pick_hk_scissors').setLabel('剪刀').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(isSolo ? 'solo_pick_hk_rock' : 'pick_hk_rock').setLabel('石頭').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(isSolo ? 'solo_pick_hk_paper' : 'pick_hk_paper').setLabel('布').setStyle(ButtonStyle.Primary)
  );
}
function getChoiceName(str) {
  if (str === 'scissors') return '剪刀';
  if (str === 'rock') return '石頭';
  if (str === 'paper') return '布';
  return '';
}
function getChoiceEmoji(str) {
  if (str === 'scissors') return '✌️';
  if (str === 'rock') return '✊';
  if (str === 'paper') return '🖐️';
  return '';
}
function judgeWinner(user, bot) {
  if (user === bot) return 'draw';
  if (
    (user === 'scissors' && bot === 'paper') ||
    (user === 'rock' && bot === 'scissors') ||
    (user === 'paper' && bot === 'rock')
  ) return 'win';
  return 'lose';
}

// 公開多人局結果
async function revealAll(channel) {
  const fields = [];
  for (const uid in session.players) {
    const pick = session.players[uid].pick;
    fields.push({
      name: `<@${uid}>`,
      value: `${getChoiceName(pick)} ${getChoiceEmoji(pick)}`,
      inline: true
    });
  }
  const picks = Object.values(session.players).map(p => p.pick);
  const winners = [];
  for (const uid in session.players) {
    const pPick = session.players[uid].pick;
    const winCount = picks.filter(other =>
      other !== pPick &&
      (
        (pPick === 'scissors' && other === 'paper') ||
        (pPick === 'rock' && other === 'scissors') ||
        (pPick === 'paper' && other === 'rock')
      )
    ).length;
    if (winCount === picks.length - 1) winners.push(`<@${uid}>`);
  }
  let resultText;
  if (winners.length === 0) resultText = '平手！';
  else if (winners.length === 1) resultText = `本局贏家：${winners[0]} 🎉`;
  else resultText = `本局多位贏家：${winners.join('、')} 🎉`;

  await channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle('剪刀石頭布對戰結果')
        .addFields(fields)
        .setDescription(resultText)
        .setColor(0x53be71)
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('next_hk').setLabel('下一局').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('end_hk').setLabel('結束').setStyle(ButtonStyle.Secondary)
      )
    ]
  });
}

async function sendSoloRound(interaction, prevPick = null) {
  await interaction.reply({
    content: '你和 Bot 的單挑！請選擇你的拳法：',
    components: [choiceButtonRow(true)],
    ephemeral: true
  });
}
