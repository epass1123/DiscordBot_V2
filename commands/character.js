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
            Sasa,
            Wisdom
        } = result.Basic;
        const imprint = Engrave.map(x => {
            return x.split(' Lv. ');
        })
        const res = imprint.map(x => {
            if (x[0] == "각인 없음") {
                return `각인 없음`
            }
            return `\`LV:${x[1]}\`: ${x[0]}\n`;
        })
        const imprintResult = res.join("");
        const Response = new MessageEmbed()
            .setFields({
                name: "캐릭터 정보\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b",
                value: `
               \`클래스\`: ${Class.Name}
               \`서 버\`: ${result.Basic.Server}
               \`길 드\`: ${result.Basic.Guild}
               \`칭 호\`: ${result.Basic.Title}
               
               \**레벨 정보\**
               \`전 투\`: ${Level.Battle}
               \`아이템\`: ${Level.Item}
               \`원정대\`: ${Level.Expedition}
               \`영 지\`: ${Wisdom.Level} ${Wisdom.Name}

               \**각인 정보\**
               ${imprintResult}
               `,
                inline: true,
            }, {
                name: "스텟 정보",
                value: `
               \`공격력\`: ${Stat.Attack}
               \`최대생명력\`: ${Stat.Health}
               \`치명\`: ${Stat.Critical}
               \`특화\`: ${Stat.Specialty}
               \`제압\`: ${Stat.Subdue}
               \`신속\`: ${Stat.Agility}
               \`인내\`: ${Stat.Endurance}
               \`숙련\`: ${Stat.Proficiency}
               
               \**성향 정보\**
               \`지성\`: ${Tendency.Intellect}
               \`담력\`: ${Tendency.Bravery}
               \`매력\`: ${Tendency.Charm}
               \`친절\`: ${Tendency.Kindness}
               `,
               inline: true,
            },
            )
            .setColor("RANDOM")
            .setTitle(`${name}님의 정보`)
            .setThumbnail(Class.Icon)

        interaction.reply({
            embeds: [Response]
        });
    },
};