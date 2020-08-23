const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const MusicClient = require("yet-another-discord.js-musicbot-addon");
const { Command } = require('discord.js-commando');

client.login(config.token);

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: "online",  //You can show online, idle....
    });
	client.user.setActivity('the world burn', { type: 'WATCHING' });
 });
 
client.music = new MusicClient(client, {
  // Set the api key used for YouTube.
  // This is required to run the bot.
    apiKey: "YOUTUBE-API-KEY-HERE",
	defVolume: 50,
	searchFilters: ['cover', 'live', 'remix', 'mix', 'parody', 'hour', 'extended', 'trailer'],
	color: 13632027,
	autoLeaveIn: 0
//    logger: logger()
});
 
client.on("message", (message) => {
  if (message.content.startsWith("ding")) {
    message.channel.send("dong!");
  } else
  if (message.content.startsWith("poo")) {
    message.channel.send("Aww shit!");
  } else
  if (message.content.startsWith("What is the website")) {
    message.channel.send("It's https://www.asshatgaming.com/ ya big dummy!");
  } else
  var dummybotuser1 = "745221937889935440";
  if(message.mentions.users.has(dummybotuser1)) {
    message.channel.send("I'm a dummy bot, ya big dummy!");
  } else
  var dummybotuser2 = "561046282769006622";
  if(message.mentions.users.has(dummybotuser2)) {
    message.channel.send("I'm a dummy bot, ya big dummy!");
  } else
  var atsplendauser = "560446299040645122";
  if(message.mentions.users.has(atsplendauser)) {
    message.channel.send("Who? That guy? He's a bad bot!");
  } else
  if (message.content.startsWith("you're not my dad")) {
    message.channel.send("bitch, yes I am");
  } else
  if (message.content.startsWith("LASAGNA!!!")) {
    message.channel.send("Lasagna sucks. It's all about that fettuccine alfredo!");
	message.channel.send("I'm disappointed");
  } else
  if (message.content.includes("hi disappointed, I'm dad")) {
    message.channel.send("Okay mom...");
  }
});