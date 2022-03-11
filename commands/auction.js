const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageActionRow,
    MessageButton
} = require('discord.js');

function priceCalculate(price, num) {
    return (price * 0.95 * (num - 1)) / num;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('경매')
        .setDescription('경매 적정가를 계산해줍니다.')
        .addNumberOption(option =>
            option.setName("최저가")
            .setDescription("경매장 최저가를 입력하세요.")
            .setRequired(true)
        ),


    async execute(interaction) {
        const {
            channel,
            options
        } = interaction;
        const Response = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('four')
                .setLabel('4인')
                .setStyle('SUCCESS'),
                new MessageButton()
                .setCustomId('eight')
                .setLabel('8인')
                .setStyle('PRIMARY'),
            )
        await interaction.reply({
            content: '레이드 인원을 선택하세요',
            components: [Response]
        });
        const price = options.getNumber("최저가");

        const filter = (inter) => {
            if (inter.user.id === interaction.user.id) return true;
            return inter.reply({
                content: "님 말고"
            })
        }

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            max: 1,
        });

        collector.on('end', (ButtonInteraction) => {
            const id = ButtonInteraction.first().customId;
            var goodPrice, myPrice;
            if (id === 'four') {
                goodPrice = Math.round(priceCalculate(price, 4));
                myPrice = Math.round((price / 4) * 3);
                interaction.channel.bulkDelete(1)
                    .then(msg => console.log(`${msg.size}만큼 삭제 완료`))
                    .catch(console.error);
                return interaction.channel.send({
                    embeds: [{
                        title:`${price}골드에 대한 경매 적정가`,
                        color: 'FUCHSIA',
                        description: `4인 레이드 기준 
                        경매 적정가: ${goodPrice}골드
                        직접 사용:  ${myPrice}골드`,
                    }]
                });
            } else if (id === 'eight') {
                myPrice = (price / 8) * 7
                goodPrice = priceCalculate(price, 8);
                interaction.channel.bulkDelete(1)
                    .then(msg => console.log(`${msg.size}만큼 삭제 완료`))
                    .catch(console.error);
                return interaction.channel.send({
                    embeds: [{
                        title:`${price}골드에 대한 경매 적정가`,
                        color: 'FUCHSIA',
                        description: `8인 레이드 기준
                        경매 적정가: ${goodPrice}골드
                        직접 사용: ${myPrice}골드`,
                    }]
                });
            }
        })
    },
};