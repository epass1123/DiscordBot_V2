const {
	SlashCommandBuilder
} = require('@discordjs/builders');
const {
	CommandInteraction,
	MessageEmbed,
	Permissions
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('메시지 삭제')
		.addNumberOption(option =>
			option.setName("글자수")
			.setDescription("지울 글자수")
			.setRequired(true)
		)
		.addUserOption(option =>
			option.setName("누구꺼").setDescription("누구꺼 지움").setRequired(false)
		),

	async execute(interaction) {
		if (interaction.memberPermissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {

			const {
				channel,
				options
			} = interaction;
			const Amount = options.getNumber("글자수");
			const Target = options.getMember("누구꺼");

			const Messages = await channel.messages.fetch();

			const Response = new MessageEmbed()
				.setColor("LUMINOUS_VIVID_PINK");

			if (Target) {
				let i = 0;
				const filtered = [];
				(await Messages).filter((m) => {
					if (m.author.id === Target.id && Amount > i) {
						filtered.push(m);
						i++;
					}
				});
				await channel.bulkDelete(filtered, true).then(messages => {
					Response.setDescription(`${Target}님의 메시지를 ${messages.size}개 삭제했습니다.`);
					interaction.reply({
						embeds: [Response]
					});
				});
			} else {
				await channel.bulkDelete(Amount, true).then(messages => {
					Response.setDescription(`메시지를 ${messages.size}개 삭제했습니다.`);
					interaction.reply({
						embeds: [Response]
					});
				})
			}
		} else {
			return interaction.reply("권한이 없습니다.")
		}
	},
};