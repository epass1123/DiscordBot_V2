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
            if (err) {
                resolve(err);
            } else {
                if (res.body === "오류 발생") {
                    resolve(null);
                } else {
                    resolve(JSON.parse(res.body));
                }
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
        if (!result) {
            interaction.reply({
                content: "존재하지 않는 캐릭터입니다."
            });
            return
        }
        const {
            Class,
            Engrave,
            Level,
            Stat,
            Tendency,
            CharacterList,
            Card,
            Items,
            Jewl,
            Sasa
        } = result.Basic;
        const imprint = Engrave.map(x=>{
            return x.split(' Lv. ');
        })
        const res = imprint.map(x=>{
            return `\`LV:${x[1]}\`: ${x[0]}\n`;
        })
        const imprintResult = res.join("");
        const Response = new MessageEmbed()
            .setFields({
                name: `캐릭터 정보`,
                value: `
               \`클래스\`: \b${Class.Name}
               \`서 버\`: \b${result.Basic.Server}
               \`길 드\`: \b${result.Basic.Guild}
               \`칭 호\`: \b${result.Basic.Title}
               \`전 투\`: \b${Level.Battle}
               \`아이템\`: \b${Level.Item}
               \`원정대\`: \b${Level.Expedition}`,
                inline: true,
            })
            .addField("각인 정보", 
            `${imprintResult}
            `, true)
            .setColor("RANDOM")
            .setTitle(`${name}님의 정보`)
            .setThumbnail(Class.Icon)

        interaction.reply({
            embeds: [Response]
        });
    },
};