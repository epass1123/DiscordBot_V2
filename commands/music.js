const {
	MessageEmbed
} = require("discord.js")
const {
	SlashCommandBuilder
} = require('@discordjs/builders');
const {
	joinVoiceChannel,
	VoiceConnectionStatus,
	createAudioPlayer,
	NoSubscriberBehavior,
	createAudioResource,
	generateDependencyReport,
	AudioPlayerStatus
} = require('@discordjs/voice');

const search = require('yt-search');
const fs = require('fs');
const ytdl = require("ytdl-core");
const streamOptions = {
	seek: 0,
	volume: 1
};
var servers = {};
let playList = [];
require('dotenv').config();

module.exports = {

	data: new SlashCommandBuilder()
		.setName('노래')
		.setDescription('노래를 재생한다.')
		.addStringOption(option =>
			option.setName("제목")
			.setDescription("노래 제목을 입력하세요")
			.setRequired(true)
		),
	async execute(interaction) {
		const vc = interaction.member.voice.channel;
		const {
			channel,
			options
		} = interaction;
		if (!vc) {
			return interaction.reply("채널에 먼저 참가하세요.")
		} else {
			const connection = joinVoiceChannel({
				channelId: vc.id,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			const player = createAudioPlayer({
				behaviors: {
					noSubscriber: NoSubscriberBehavior.Pause,
				}
			})
			connection.subscribe(player);

			const song = options.getString("제목");
			await search({
					query: song,
					pageStart: 1,
					pageEnd: 1,
				},
				async function (err, r) {
					if (r) {
						if (!servers[interaction.guild.id]) servers[interaction.guild.id] = {
							queue: []
						}
						var server = servers[interaction.guild.id];
						let ytResults = r.videos;
						ytResults.splice(10);
						let i = 0;
						let titles = ytResults.map(result => {
							i++;
							return i + ") " + result.title + '  \:arrow_forward:  ' + result.timestamp;
						});

						interaction.reply({
							embeds: [{
								title: '번호로 노래를 고르세요',
								description: titles.join("\n"),
							}]
						}).catch(err => console.log(err));

						const filter = (m) => {
							if (m.author.id === interaction.user.id &&
								m.content >= 1 &&
								m.content <= ytResults.length) {
								return true;
							}
						};

						const collected = await interaction.channel.createMessageCollector({
							filter,
							max: 1,
						});

						collected.on('collect', (message) => {
							let selected = ytResults[message.content - 1];
							stream = ytdl(selected.url, {
								filter: "audioonly",
								highWaterMark: 1 << 25,
							}, streamOptions);
							resource = createAudioResource(stream);
							console.log(resource)
							server.queue.push(selected.url);

							playList.push({
								user: interaction.user.username,
								songTitle: selected.title
							});

							const newSong = new MessageEmbed()
								.setColor('RANDOM')
								.setTitle(selected.title)
								.setURL(selected.url)
								.setDescription(selected.description)
								.setThumbnail(selected.thumbnail);
							interaction.editReply({
								embeds: [newSong]
							});
							channel.bulkDelete(1)
								.then(msg => console.log(`${msg.size}만큼 삭제 완료`))
								.catch(console.error);

							
							player.on(AudioPlayerStatus.Idle, () =>{
								player.stop();
								connection.destroy();
							})

							player.on('error', error => {
								console.error('Error:', error.message, 'with track', error.resource.metadata.title);
							});
							player.play(resource);
						})

					}
					if (err) throw err;
				}
			);

			connection.on(VoiceConnectionStatus.Ready, () => {
				console.log('The connection has entered the Ready state - ready to play audio!');
			});
		}
	},
};