module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;
    if (interaction.isCommand()) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        });
      }
    }

    else if (interaction.isButton()) {
      console.log(interaction);
      if (interaction.customId == 'valtan') {
        interaction.reply({
          content: "1",
          ephemeral:true,
        });
      } else if (interaction.customId == "viakiss") {
        interaction.reply({
          content: `2`
        });
      }

    }

  },


};