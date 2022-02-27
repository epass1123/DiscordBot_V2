const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageActionRow,
    MessageButton,
    MessageEmbed
} = require('discord.js');
const request = require("request");

function crawl(nick) {
    var url = "http://152.70.248.4:5000/userinfo/"
    return new Promise(resolve => {
        url = url + encodeURI(nick);
        request(url, function (err, res, body) {
            if (error) {
                
            } else {
                resolve(JSON.parse(res.body));
            }
        });
    })
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

        const name = String(options.getString("캐릭터명"));
        const result = await crawl(name);
        const Response = new MessageEmbed()
            .setColor("RANDOM")
            .setDescription(`이름: ${result.Basic.Name}
            서버: ${result.Basic.Server}`)
            .setThumbnail(result.Basic.Class.Icon);

        interaction.reply({
            content: `${name}님의 정보`,
            embeds: [Response]
        });

    },
};