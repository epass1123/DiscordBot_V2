const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');
const request = require("request");
var url = "http://152.70.248.4:5000/userinfo/"

async function crawl(nick) {
    url = url + encodeURI(nick);
    const result = await request(url, function (err, res, body) {
    });
    return result;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('캐릭터')
        .setDescription('캐릭터 정보를 검색합니다.')
        .addStringOption(option =>
            option.setName("캐릭터명")
            .setDescription("캐릭터명을 입력하세요.")
            .setRequired(true)
        ),


    async execute(interaction) {
        const {
            channel,
            options
        } = interaction;
        
        const character = String(options.getString("캐릭터명"));
        const result = await crawl(character);
        console.log(result)
        const Response = new MessageEmbed()
            .setColor("RANDOM")
            // .setThumbnail(result);

        // await interaction.reply({
        //     content: `${character}님의 정보`,
        //     embeds: [Response]
        // });

    },
};