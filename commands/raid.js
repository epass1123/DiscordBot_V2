const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageActionRow,
    MessageButton,
    Message,
    ButtonInteraction
} = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('레이드')
        .setDescription('같이 레이드할 파티원 구하기'),
    async execute(interaction, message) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('valtan')
                .setLabel('발탄')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId('viakiss')
                .setLabel('비아키스')
                .setStyle('SUCCESS'),
                new MessageButton()
                .setCustomId('saton')
                .setLabel('쿠크세이튼')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('nightmare')
                .setLabel('아브렐슈드   ')
                .setStyle('PRIMARY'),
            );;
        await interaction.reply({
            content: '파티원을 구할 레이드를 선택하세요',
            components: [row]
        });

        const filter = (inter) => {
            if (inter.user.id === interaction.user.id) return true;
            return inter.reply({
                content: "놉"
            })
        }

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            max: 1,
        });

        collector.on('end', (ButtonInteraction) => {
            const id = ButtonInteraction.first().customId;

            if (id === 'valtan') return interaction.channel.send('발탄');
            if (id === 'viakiss') return interaction.channel.send('비아키스');
            if (id === 'saton') return interaction.channel.send('쿠크세이튼');
            if (id === 'nightmare') return interaction.channel.send('아브렐슈드');

        })

    },
};