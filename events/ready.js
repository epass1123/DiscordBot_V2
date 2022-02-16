module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`봇이 성공적으로 작동합니다 ${client.user.tag}`);
	},
};