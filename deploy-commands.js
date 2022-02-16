const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const fs = require('fs');

const commands = []; 
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
const rest = new REST({ version: '9' }).setToken(process.env.token);

const GuildIds = process.env.GUILD_IDS.split(",");
console.log(GuildIds);

(async () => {
  GuildIds.map(async(guildId) => {
  try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands },
      );      
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  });
    
//   try{
//     await rest.put(
//         Routes.applicationCommands(process.env.CLIENT_ID),
//         { body: commands },
//     );

//     console.log(`글로벌 서버에 성공적으로 등록 완료.`);
//   }
//   catch(error){
//     console.log(error);
//   }
})();