const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('야')
		.setDescription('안녕이라고 말한다'),
	async execute(interaction) {
		await interaction.reply('안녕하세요!');
	},
};