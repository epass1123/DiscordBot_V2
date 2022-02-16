const Discord = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
	name: 'guildMemberAdd',
	async execute(member) {
        // member.guild.channels.cache.get("785864141789331516").send(`환영합니다. ${member.user}님!`);
        // console.log(member);
        const guildSettings = await GuildSettings.findOne({ guild_id: member.guild.id });

        if(!guildSettings || !guildSettings.welcome_channel_id){
            return;
        }

        const newMemberEmbed = new Discord.MessageEmbed()
            .setColor("#d81e5b")
            .setTitle("환영합니다!!")
            .setDescription(`${member.user}님이 들어왔습니다.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

            member.guild.channels.cache.get(guildSettings.welcome_channel_id).send(
                {embeds : [newMemberEmbed]
            });

    },
};