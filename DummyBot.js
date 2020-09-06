'use strict';

/**
 * Module Imports
 */
require('dotenv').config();

const { Client, Collection } = require("discord.js");
const Discord = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX } = require("./config.json");
const config = require('./config.json');
const axios = require('axios');
const Cleverbot = require('clevertype').Cleverbot;

const TwitchMonitor = require("./twitch-monitor");
const DiscordChannelSync = require("./discord-channel-sync");
const LiveEmbed = require('./live-embed');
const MiniDb = require('./minidb');

const request = require('request');
const entities = require('entities');
const logger = require('./logger');
const validUrl = require('valid-url');

const client = new Client({ disableMentions: "everyone" });

global.discordJsClient = client;

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let botReady = false;
let lastTimestamp = Math.floor(Date.now() / 1000);

let Guild;
let Channel;

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setPresence({
      status: "online",  //You can show online, idle....
  });
  
  // Init list of connected servers, and determine which channels we are announcing to
  syncServerList(true);

  // Keep our activity in the user list in sync
  StreamActivity.init(client);

  // Begin Twitch API polling
  TwitchMonitor.start();
  
  Guild = client.guilds.cache.get(process.env.DISCORD_SERVERID);
  if (Guild) {
    Channel = Guild.channels.cache.get(process.env.DISCORD_CHANNELID);
  }

  if (!Channel) {
    logger.error('A matching channel could not be found. Please check your DISCORD_SERVERID and DISCORD_CHANNELID environment variables.');
    process.exit(1);
  } else {
    botReady = true;
  }
});

client.on("warn", (info) => console.log(info));
client.on("error", () => {
	console.log(console.error);
	botReady = false;
});
client.on('shardReconnecting', id => console.log(`Reconnecting to shard ID ${id}`));

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

// --- Twitch functions init -----------------------------------------------------------------------------------
let cleverbot = null;

if (config.cleverbot_token) {
    cleverbot = new Cleverbot({
        apiKey: config.cleverbot_token,
        emotion: 0,
        engagement: 0,
        regard: 100
    }, true);
}

// --- Twitch Discord functions --------------------------------------------------------------------------------
let targetChannels = [];
let emojiCache = { };

let getServerEmoji = (emojiName, asText) => {
    if (typeof emojiCache[emojiName] !== "undefined") {
        return emojiCache[emojiName];
    }

    try {
        let emoji = client.emojis.cache.find(e => e.name === emojiName);

        if (emoji) {
            emojiCache[emojiName] = emoji;

            if (asText) {
                return emoji.toString();
            } else {
                return emoji.id;
            }
        }
    } catch (e) {
        console.error(e);
    }

    return null;
};
global.getServerEmoji = getServerEmoji;

let syncServerList = (logMembership) => {
    targetChannels = DiscordChannelSync.getChannelList(client, config.discord_announce_channel, logMembership);
};

client.on("guildCreate", guild => {
    console.log(`[Discord]`, `Joined new server: ${guild.name}`);

    syncServerList(false);
});

client.on("guildDelete", guild => {
    console.log(`[Discord]`, `Removed from a server: ${guild.name}`);

    syncServerList(false);
});

client.on("message", async (message) => {
  if (message.content === ("ding")) {
    message.channel.send("dong!");
  }

  if (message.content === ("bading")) {
    message.channel.send("badong!");
  }

  if (message.content === ("dingaling")) {
    message.channel.send("dongalong!");
  }

  if (message.content === ("dingalingadingdong")) {
    message.channel.send("dongalongadongding!");
  }

  if (message.content.startsWith("poo")) {
    message.channel.send("Aww shit!");
  }
	
  if (message.content.startsWith("What is the website")) {
    message.channel.send("It's https://www.asshatgaming.com/ ya big dummy!");
  }

  if (message.content.startsWith("kaboom")) {
    message.channel.send("HIT THE DECK!!!");
  }
	
  var dummybotuser1 = "745221937889935440";
  if(message.mentions.users.has(dummybotuser1)) {
    message.channel.send("I'm a dummy bot, ya big dummy!");
  }
	
  var dummybotuser2 = "561046282769006622";
  if(message.mentions.users.has(dummybotuser2)) {
    message.channel.send("I'm a dummy bot, ya big dummy!");
  }
	
  var atsplendauser = "560446299040645122";
  if(message.mentions.users.has(atsplendauser)) {
    message.channel.send("Who? That guy? He's a bad bot!");
  }
	
  if (message.content === ("you're not my dad")) {
    message.channel.send("bitch, yes I am");
  }

  if (message.content === ("LASAGNA!!!")) {
    message.channel.send("Lasagna sucks. It's all about that fettuccine alfredo!");
	message.channel.send("I'm disappointed");
  }

  if (message.content === ("hi disappointed, I'm dad")) {
    message.channel.send("Okay mom...");
  }
  
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.channel.send("There was an error executing that command.").catch(console.error);
  }
});

// Activity updater
class StreamActivity {
    /**
     * Registers a channel that has come online, and updates the user activity.
     */
    static setChannelOnline(stream) {
        this.onlineChannels[stream.user_name] = stream;

        this.updateActivity();
    }

    /**
     * Marks a channel has having gone offline, and updates the user activity if needed.
     */
    static setChannelOffline(stream) {
        delete this.onlineChannels[stream.user_name];

        this.updateActivity();
    }

    /**
     * Fetches the channel that went online most recently, and is still currently online.
     */
    static getMostRecentStreamInfo() {
        let lastChannel = null;
        for (let channelName in this.onlineChannels) {
            if (typeof channelName !== "undefined" && channelName) {
                lastChannel = this.onlineChannels[channelName];
            }
        }
        return lastChannel;
    }

    /**
     * Updates the user activity on Discord.
     * Either clears the activity if no channels are online, or sets it to "watching" if a stream is up.
     */
    static updateActivity() {
        let streamInfo = this.getMostRecentStreamInfo();

        if (streamInfo) {
            this.discordClient.user.setActivity(streamInfo.user_name, {
                "url": `https://twitch.tv/${streamInfo.user_name.toLowerCase()}`,
                "type": "STREAMING"
            });

            console.log('[StreamActivity]', `Update current activity: watching ${streamInfo.user_name}.`);
        } else {
            console.log('[StreamActivity]', 'Cleared current activity.');

            this.discordClient.user.setActivity('the world burn', { type: 'WATCHING' });
        }
    }

    static init(discordClient) {
        this.discordClient = discordClient;
        this.onlineChannels = { };

        this.updateActivity();

        // Continue to update current stream activity every 5 minutes or so
        // We need to do this b/c Discord sometimes refuses to update for some reason
        // ...maybe this will help, hopefully
        setInterval(this.updateActivity.bind(this), 5 * 60 * 1000);
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Live events

let liveMessageDb = new MiniDb('live-messages');
let messageHistory = liveMessageDb.get("history") || { };

TwitchMonitor.onChannelLiveUpdate((streamData) => {
    const isLive = streamData.type === "live";

    // Refresh channel list
    try {
        syncServerList(false);
    } catch (e) { }

    // Update activity
    StreamActivity.setChannelOnline(streamData);

    // Generate message
    const msgFormatted = `${streamData.user_name} went live on Twitch!`;
    const msgEmbed = LiveEmbed.createForStream(streamData);

    // Broadcast to all target channels
    let anySent = false;

    for (let i = 0; i < targetChannels.length; i++) {
        const discordChannel = targetChannels[i];
        const liveMsgDiscrim = `${discordChannel.guild.id}_${discordChannel.name}_${streamData.id}`;

        if (discordChannel) {
            try {
                // Either send a new message, or update an old one
                let existingMsgId = messageHistory[liveMsgDiscrim] || null;

                if (existingMsgId) {
                    // Fetch existing message
                    discordChannel.messages.fetch(existingMsgId)
                      .then((existingMsg) => {
                        existingMsg.edit(msgFormatted, {
                          embed: msgEmbed
                        }).then((message) => {
                          // Clean up entry if no longer live
                          if (!isLive) {
                            delete messageHistory[liveMsgDiscrim];
                            liveMessageDb.put('history', messageHistory);
                          }
                        });
                      })
                      .catch((e) => {
                        // Unable to retrieve message object for editing
                        if (e.message === "Unknown Message") {
                            // Specific error: the message does not exist, most likely deleted.
                            delete messageHistory[liveMsgDiscrim];
                            liveMessageDb.put('history', messageHistory);
                            // This will cause the message to be posted as new in the next update if needed.
                        }
                      });
                } else {
                    // Sending a new message
                    if (!isLive) {
                        // We do not post "new" notifications for channels going/being offline
                        continue;
                    }

                    // Expand the message with a @mention for "here" or "everyone"
                    // We don't do this in updates because it causes some people to get spammed
                    let mentionMode = (config.discord_mentions && config.discord_mentions[streamData.user_name.toLowerCase()]) || null;

                    if (mentionMode) {
                        mentionMode = mentionMode.toLowerCase();

                        if (mentionMode === "everyone" || mentionMode === "here") {
                            // Reserved @ keywords for discord that can be mentioned directly as text
                            mentionMode = `@${mentionMode}`;
                        } else {
                            // Most likely a role that needs to be translated to <@&id> format
                            let roleData = discordChannel.guild.roles.cache.find((role) => {
                                return (role.name.toLowerCase() === mentionMode);
                            });

                            if (roleData) {
                                mentionMode = `<@&${roleData.id}>`;
                            } else {
                                console.log('[Discord]', `Cannot mention role: ${mentionMode}`,
                                  `(does not exist on server ${discordChannel.guild.name})`);
                                mentionMode = null;
                            }
                        }
                    }

                    let msgToSend = msgFormatted;

                    if (mentionMode) {
                        msgToSend = msgFormatted + ` ${mentionMode}`
                    }

                    let msgOptions = {
                        embed: msgEmbed
                    };

                    discordChannel.send(msgToSend, msgOptions)
                        .then((message) => {
                            console.log('[Discord]', `Sent announce msg to #${discordChannel.name} on ${discordChannel.guild.name}`)

                            messageHistory[liveMsgDiscrim] = message.id;
                            liveMessageDb.put('history', messageHistory);
                        })
                        .catch((err) => {
                            console.log('[Discord]', `Could not send announce msg to #${discordChannel.name} on ${discordChannel.guild.name}:`, err.message);
                        });
                }

                anySent = true;
            } catch (e) {
                console.warn('[Discord]', 'Message send problem:', e);
            }
        }
    }

    liveMessageDb.put('history', messageHistory);
    return anySent;
});

TwitchMonitor.onChannelOffline((streamData) => {
    // Update activity
    StreamActivity.setChannelOffline(streamData);
});

// --- Common functions ------------------------------------------------------------------------------------------------
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.spacifyCamels = function () {
    let target = this;

    try {
        return target.replace(/([a-z](?=[A-Z]))/g, '$1 ');
    } catch (e) {
        return target;
    }
};

Array.prototype.joinEnglishList = function () {
    let a = this;

    try {
        return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ' and ');
    } catch (e) {
        return a.join(', ');
    }
};

String.prototype.lowercaseFirstChar = function () {
    let string = this;
    return string.charAt(0).toUpperCase() + string.slice(1);
};

Array.prototype.hasEqualValues = function (b) {
    let a = this;

    if (a.length !== b.length) {
        return false;
    }

    a.sort();
    b.sort();

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};

const subredditUrl = `https://www.reddit.com/r/${process.env.SUBREDDIT}/new.json?limit=10`;

setInterval(() => {
  if (botReady) {
    request({
      url: subredditUrl,
      json: true,
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        logger.debug('Request succeeded, lastTimestamp = ', lastTimestamp);
        for (const post of body.data.children.reverse()) {
          if (lastTimestamp <= post.data.created_utc) {
            lastTimestamp = post.data.created_utc;

            const embed = new Discord.MessageEmbed();
            embed.setColor(process.env.EMBED_COLOR || '#007cbf');
            embed.setTitle(`${post.data.link_flair_text ? `[${post.data.link_flair_text}] ` : ''}${entities.decodeHTML(post.data.title)}`);
            embed.setURL(`https://redd.it/${post.data.id}`);
            embed.setDescription(`${post.data.is_self ? entities.decodeHTML(post.data.selftext.length > 253 ? post.data.selftext.slice(0, 253).concat('...') : post.data.selftext) : ''}`);
            embed.setThumbnail(validUrl.isUri(post.data.thumbnail) ? entities.decodeHTML(post.data.thumbnail) : null);
            embed.setFooter(`${post.data.is_self ? 'Self post' : 'Link post'} by ${post.data.author}`);
            embed.setTimestamp(new Date(post.data.created_utc * 1000));

            Channel.send({ embed: embed}).then(() => {
              logger.debug(`Sent message for new post https://redd.it/${post.data.id}`);
            }).catch(err => {
              logger.error(embed, err);
            });
          }
        }
        ++lastTimestamp;
      } else {
        logger.warn('Request failed - reddit could be down or subreddit doesn\'t exist. Will continue.');
        logger.debug(response, body);
      }
    });
  }
}, 30 * 1000); // 30 seconds