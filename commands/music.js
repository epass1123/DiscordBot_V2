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
	AudioPlayerStatus,
	entersState
} = require('@discordjs/voice');

const search = require('yt-search');
const fs = require('fs');
const ytdl = require("ytdl-core");
const { connection } = require("mongoose");
const streamOptions = {
	seek: 0,
	volume: 1
};
var servers = {};
let playList = [];
let checkOverlap = null;
var player;
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

							selected = ytResults[message.content - 1];

							server.queue.push(selected.url);
							console.log(server.queue);

							
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
								.then()
								.catch(console.error);
	
							if (!checkOverlap) {
								var stream = ytdl(server.queue[0], {
									filter: "audioonly",
									highWaterMark: 1 << 25,
								}, streamOptions);
	
								resource = createAudioResource(stream);
	
								player = createAudioPlayer({
									behaviors: {
										noSubscriber: NoSubscriberBehavior.Pause,
									}
								})
								connection.subscribe(player);
								checkOverlap = true;
								player.play(resource);
								server.queue.shift();
							}
	
							player.on('error', error => {
								console.error(error);
							});
	
							player.on(AudioPlayerStatus.Idle, () => {
								const nextSong = server.queue.shift();
								if (nextSong) {
									var song = ytdl(nextSong, {
										filter: "audioonly",
										highWaterMark: 1 << 25,
									}, streamOptions);
									const result = createAudioResource(song);
									player.play(result);
								}
								else{
									console.log("Nothing in queue")
									// player.stop();
									// connection.destroy();
								}
							});
	
							player.on('stateChange', (oldState, newState) => {
								console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
							});
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

	// data: new SlashCommandBuilder()
	// 	.setName('스킵')
	// 	.setDescription('노래를 스킵한다.')
	// 	,
	// async execute(interaction) {

	// }
};