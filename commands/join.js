const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config();

module.exports = {
	
	data: new SlashCommandBuilder()
		.setName('참가')
		.setDescription('꿀벌봇이 음성채널에 참가한다.'),
	async execute(interaction) {

		const connection = joinVoiceChannel({
			channelId: process.env.CLIENT_ID,
			guildId: process.env.GUILD_ID,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});

		await interaction.reply('안녕하세요!');
	},
};