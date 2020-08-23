// File and connection dependencies
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const client = new Discord.Client();
const config = require("./config.json");

const queue = new Map();

client.login(config.token);

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: "online",  //You can show online, idle....
    });
	client.user.setActivity('the world burn', { type: 'WATCHING' });
 });
 
client.on("reconnecting", () =>{
	console.log(`Reconnecting...`);
});

client.on("disconnect", () =>{
	console.log(`Disconnected!`);
});

// Debugging Code
client.on("debug", function(info){
    console.log(`debug -> ${info}`);
});

// Commands
client.on("message", async message => {
const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith("ding") & !message.content.startsWith(config.prefix)) {
    message.channel.send("dong!");
  } else
  if (message.content.startsWith("poo") & !message.content.startsWith(config.prefix)) {
    message.channel.send("Aww shit!");
  } else
  if (message.content.startsWith("What is the website") & !message.content.startsWith(config.prefix)) {
    message.channel.send("It's https://www.asshatgaming.com/ ya big dummy!");
  } else
  var dummybotuser1 = "745221937889935440";
  if(message.mentions.users.has(dummybotuser1) & !message.content.startsWith(config.prefix)) {
    message.channel.send("I'm a dummy bot, ya big dummy!");
  } else
  var dummybotuser2 = "561046282769006622";
  if(message.mentions.users.has(dummybotuser2) & !message.content.startsWith(config.prefix)) {
    message.channel.send("I'm a dummy bot, ya big dummy!");
  } else
  var atsplendauser = "560446299040645122";
  if(message.mentions.users.has(atsplendauser) & !message.content.startsWith(config.prefix)) {
    message.channel.send("Who? That guy? He's a bad bot!");
  } else
  if (message.content.startsWith("you're not my dad") & !message.content.startsWith(config.prefix)) {
    message.channel.send("bitch, yes I am");
  } else
  if (message.content.startsWith("LASAGNA!!!") & !message.content.startsWith(config.prefix)) {
    message.channel.send("Lasagna sucks. It's all about that fettuccine alfredo!");
	message.channel.send("I'm disappointed");
  } else
  if (message.content.includes("hi disappointed, I'm dad") & !message.content.startsWith(config.prefix)) {
    message.channel.send("Okay mom...");
  } else
  if (message.content.startsWith(`${config.prefix}play`) & !message.author.bot) {
    execute(message, serverQueue);
    return;
  } else
  if (message.content.startsWith(`${config.prefix}skip`) & !message.author.bot) {
    skip(message, serverQueue);
    return;
  } else
  if (message.content.startsWith(`${config.prefix}stop`) & !message.author.bot) {
    stop(message, serverQueue);
    return;
  }
});

// Music Function Code
async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}