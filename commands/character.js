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
            Wisdom
        } = result.Basic;

        const imprint = Engrave.map(x => {
            return x.split(' Lv. ');
        })
        const imprintResult = imprint.map(x => {
            if (x[0] == "각인 없음") {
                return `각인 없음`
            }
            return `\`LV:${x[1]}\`: ${x[0]}\n`;
        }).join("");
        const row = new MessageActionRow().
        addComponents(
            new MessageButton()
            .setCustomId('캐릭터')
            .setLabel('캐릭터 정보')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId('장비')
            .setLabel('장비 정보')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId('장신구')
            .setLabel('장신구 정보')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId('보석')
            .setLabel('보석')
            .setStyle('SECONDARY'),
        )

        const row2 = new MessageActionRow().addComponents(

            new MessageButton()
            .setCustomId('스킬')
            .setLabel('스킬 목록')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId('목록')
            .setLabel('캐릭터 목록')
            .setStyle('SECONDARY'),
        )

        const charInfo = new MessageEmbed()
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
            }, )
            .setColor("RANDOM")
            .setTitle(`${name}님의 정보`)
            .setThumbnail(Class.Icon)

        const Item = new MessageEmbed()
            .setFields({
                name: `\:white_check_mark\: ${result.Items["머리 방어구"].Name} | \`품질\`${result.Items["머리 방어구"].Quality|| ``}`,
                value: `
                    ${result.Items["머리 방어구"].Tri.map(x=>{return `\`${x.SkillName}\`${x.Effect}\n`}).join("")}

                    \:white_check_mark\: \**${result.Items["상의"].Name} | \`품질\`${result.Items["상의"].Quality|| ``}\**
                    ${result.Items["상의"].Tri.map(x=>{return `\`${x.SkillName}\`${x.Effect}\n`}).join("")}
                    
                    \:white_check_mark\: \**${result.Items["하의"].Name} | \`품질\`${result.Items["하의"].Quality || ``}\**
                    ${result.Items["하의"].Tri.map(x=>{return `\`${x.SkillName}\`${x.Effect}\n`}).join("")}
                                        
                    `,
                inline: true,
            }, {
                name: `\:white_check_mark\: ${result.Items["어깨 방어구"].Name} | \`품질\`${result.Items["어깨 방어구"].Quality|| ``}`,
                value: `
                    ${result.Items["어깨 방어구"].Tri.map(x=>{return `\`${x.SkillName}\`${x.Effect}\n`}).join("")}
                    
                    \:white_check_mark\: \**${result.Items["장갑"].Name} | \`품질\`${result.Items["장갑"].Quality|| ``}\**
                    ${result.Items["장갑"].Tri.map(x=>{return `\`${x.SkillName}\`${x.Effect}\n`}).join("")}

                    \**\`팔찌\`: ${result.Items["팔찌"].Name}\**
                    ${''||result.Items["팔찌"].Plus.map(x=>{return `${x}\n`}).join("")}
                    `,
                inline: true
            })
            .setTitle("장착중인 장비 정보")

        const acc = new MessageEmbed()
            .setFields({
                name: `장신구 정보`,
                value: `
                \:white_check_mark\:\`어빌리티 스톤\`: ${result.Items["어빌리티 스톤"].Name} | ${result.Items["어빌리티 스톤"].Plus|| ``} ${result.Items["어빌리티 스톤"].Engrave.map(x=>{return `${x.EngraveName}${x.Effect}`})}
                \:white_check_mark\: 목걸이: ${result.Items["목걸이"].Name} | ${result.Items["목걸이"].Plus|| ``} | 품질: ${result.Items["목걸이"].Quality|| ``} 
                ${result.Items["목걸이"].Engrave.map(x=>{return `\`${x.EngraveName}\`${x.Effect}\n`}).join("")}
                \:white_check_mark\: 귀걸이1: ${result.Items["귀걸이1"].Name} | ${result.Items["귀걸이1"].Plus|| ``} | 품질: ${result.Items["귀걸이1"].Quality|| ``} 
                ${result.Items["귀걸이1"].Engrave.map(x=>{return `\`${x.EngraveName}\`${x.Effect}\n`}).join("")}
                \:white_check_mark\: 귀걸이2: ${result.Items["귀걸이2"].Name} | ${result.Items["귀걸이2"].Plus|| ``} | 품질: ${result.Items["귀걸이2"].Quality|| ``} 
                ${result.Items["귀걸이2"].Engrave.map(x=>{return `\`${x.EngraveName}\`${x.Effect}\n`}).join("")}
                \:white_check_mark\: 반 지1: ${result.Items["반지1"].Name} | ${result.Items["반지1"].Plus|| ``} | 품질: ${result.Items["반지1"].Quality|| ``} 
                ${result.Items["반지1"].Engrave.map(x=>{return `\`${x.EngraveName}\`${x.Effect}\n`}).join("")}
                \:white_check_mark\: 반 지2: ${result.Items["반지2"].Name} | ${result.Items["반지2"].Plus|| ``} | 품질: ${result.Items["반지2"].Quality|| ``} 
                ${result.Items["반지2"].Engrave.map(x=>{return `\`${x.EngraveName}\`${x.Effect}\n`}).join("")}`,
            })

        interaction.reply({
            embeds: [charInfo],
            components: [row, row2]
        });

        const filter = (inter) => {
            if (inter.user.id === interaction.user.id) return true;
            return inter.reply({
                content: "놉"
            })
        }

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 120 * 1000,
        })

        collector.on("collect", async (ButtonInteraction) => {
            const id = ButtonInteraction.customId;
            if (id === "캐릭터") {
                await interaction.editReply({
                    embeds: [charInfo],
                    components: [row, row2],
                })
            }
            if (id === "장비") {
                await interaction.editReply({
                    embeds: [Item],
                    components: [row, row2],
                })
            }
            if (id === "장신구") {
                await interaction.editReply({
                    embeds: [acc],
                    components: [row, row2],
                })
            }
            if (id === "보석") {
                await interaction.editReply({
                    embeds: [Response],
                    components: [row, row2],
                })
            }
            if (id === "스킬") {
                await interaction.editReply({
                    embeds: [Response],
                    components: [row, row2],
                })
            }
            if (id === "목록") {
                await interaction.editReply({
                    embeds: [Response],
                    components: [row, row2],
                })
            }
        })
    },
};