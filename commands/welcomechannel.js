const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('채널설정')
		.setDescription('환영 메시지를 보낼 채널 설정')
        .addChannelOption(option => 
            option.setName("설정")
            .setDescription("이 채널로 설정")
            .setRequired(true)),
	async execute(interaction) {
        
        if(!interaction.member.permissions.has([Permissions.FLAGS.ADMINISTRATOR])) {
            interaction.reply('권한 없음');
            return;
        }

        GuildSettings.findOne({ guild_id: interaction.guild.id }, (error, settings) =>{
            if (error){
                console.log(error);
                interaction.reply("오류 발생");
                return;
            }
            
            if(!settings){
                settings= new GuildSettings({
                    guild_id: interaction.guild.id,
                    welcome_channel_id: interaction.options.getChannel("설정").id
                });
            } else{
                settings.welcome_channel_id = interaction.options.getChannel("설정").id;
            }

            settings.save(error => {
                if(error) {
                    console.log(error);
                    interaction.reply("오류 발생");
                    return;
                }

                interaction.reply(`환영 채널이 ${interaction.options.getChannel("설정")}`);

            })
        })

    },
};