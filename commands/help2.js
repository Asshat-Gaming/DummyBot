const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help2",
  aliases: ["h2"],
  description: "Display the second page of all commands and descriptions",
  execute(message) {
    let commands = message.client.commands.array();

    let helpEmbed = new MessageEmbed()
      .setTitle("Dummy Bot Help - Page 2")
      .setDescription("List of all commands")
      .setColor("#F8AA2A");

    helpEmbed.addField(
	  `**ding**`,
	  `Ding the bot`,
      true
	);

    helpEmbed.addField(
	  `**bading**`,
	  `Bading the bot`,
	  true
	);

    helpEmbed.addField(
	  `**dingaling**`,
	  `Dingaling the bot`,
	  true
	);

    helpEmbed.addField(
      `**dingalingadingdong**`,
	  `Dingalingadingdong the bot`,
	  true
	);

    helpEmbed.addField(
      `**kaboom**`,
	  `Make the bot hear an explosion`,
	  true
	);

    helpEmbed.addField(
      `**poo**`,
	  `Share your frustrations with the bot`,
	  true
	);

    helpEmbed.addField(
	  `**What is the website**`,
	  `Ask the bot to tell you the main website URL`,
	  true
	);

    helpEmbed.addField(
      `**@Dummy Bot**`,
	  `Mention the bot`,
	  true
	);

    helpEmbed.addField(
      `**@atsplenda**`,
	  `Ask the bot its opinion of the atsplenda bot`,
	  true
	);
	
	helpEmbed.addField(
      `**dummy playlist-save <playlist name>**`,
	  `Saves the current queue into a new playlist`,
	  true
	);
	
	helpEmbed.addField(
      `**dummy playlist-play <playlist name>**`,
	  `Plays the specified playlist`,
	  true
	);
	
	helpEmbed.addField(
      `**dummy playlist-list**`,
	  `Lists all saved playlists`,
	  true
	);
	
	helpEmbed.addField(
      `**dummy playlist-list <playlist name>**`,
	  `Lists all songs in the specified playlist`,
	  true
	);
	
	helpEmbed.addField(
      `**dummy playlist-edit <playlist name>**`,
	  `Edits the specified playlist using the provided guide`,
	  true
	);
	
	helpEmbed.addField(
      `**dummy playlist-delete <playlist name>**`,
	  `Deletes the specified playlist`,
	  true
	);

    return message.channel.send(helpEmbed).catch(console.error);
  }
};
