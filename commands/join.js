const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    joinVoiceChannel,
} = require('@discordjs/voice');

const search = require('yt-search');
const fs = require('fs');
const ytdl = require("ytdl-core");
var servers = {};
let playList = [];
require('dotenv').config();

module.exports = {

    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('채널에 참가한다'),
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

            interaction.reply(`${interaction.user}님이 꿀벌봇을 부름.`)
        }
    },
};