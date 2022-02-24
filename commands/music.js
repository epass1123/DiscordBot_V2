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
} = require('@discordjs/voice');

const search = require('yt-search');
const fs = require('fs');
const ytdl = require("ytdl-core");
var servers = {};
let playList = [];
require('dotenv').config();

function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.playStream(ytdl(server.queue[0], {
		filter: "audioonly",
		highWaterMark: 1 << 25
	}), streamOptions);
	server.queue.shift();

	server.dispatcher.on("end", function () {
		if (server.queue[0]) {
			setTimeout(() => {
				play(connection, message);
				playList.shift();
			}, 5000);

		} else {
			connection.disconnect();
		}
	});
}


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
		console.log(interaction);
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

			const song = options.getString("제목");
			console.log("서치전")
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
						console.log("서치후")
						let ytResults = r.videos;
						ytResults.splice(10);
						let i = 0;
						let titles = ytResults.map(result => {
							i++;
							return i + ") " + result.title + '  \:arrow_forward:  ' + result.timestamp;
						});

						//  //노래검색 완료전에 다시 노래 검색하면 리턴.
						//  if(checkOverlap){
						//     message.channel.send("먼저 노래를 고르세요!");
						//     return;
						// }

						interaction.reply({
							embeds: [{
								title: '번호로 노래를 고르세요',
								description: titles.join("\n"),
							}]
						}).catch(err => console.log(err));
						// checkOverlap = true;

						console.log("필터생성")
						const filter = (m) => {
							// console.log(m)
							if (m.author.id === interaction.user.id &&
								m.content >= 1 &&
								m.content <= ytResults.length) {
								return true;
							}
						};

						console.log("selected1");
						const collected = await interaction.channel.createMessageCollector({
							filter,
							max: 1,
						});
						2
						console.log("selected2");

						collected.on('collect', (message) => {
							let selected = ytResults[message.content - 1];
							console.log(selected);
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
						})

						checkOverlap = false;
						if (interaction.guild.voiceConnection) interaction.member.voiceChannel.join()
							.then((connection) => {
								play(connection, message);
							});
						if (interaction.guild.voiceConnection && !playList[1]) interaction.member.voiceChannel.join()
							.then((connection) => {
								play(connection, message);
							});
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