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

    return message.channel.send(helpEmbed).catch(console.error);
  }
};
