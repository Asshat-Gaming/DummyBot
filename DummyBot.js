/**
 * Module Imports
 */
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX } = require("./config.json");

const client = new Client({ disableMentions: "everyone" });

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setPresence({
      status: "online",  //You can show online, idle....
  });
  client.user.setActivity('the world burn', { type: 'WATCHING' });
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  if (message.content.startsWith("ding")) {
    message.channel.send("dong!");
  }

  if (message.content.startsWith("bading")) {
    message.channel.send("badong!");
  }
  
  if (message.content.startsWith("poo")) {
    message.channel.send("Aww shit!");
  }
	
  if (message.content.startsWith("What is the website")) {
    message.channel.send("It's https://www.asshatgaming.com/ ya big dummy!");
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
	
  if (message.content.startsWith("you're not my dad")) {
    message.channel.send("bitch, yes I am");
  }

  if (message.content.startsWith("LASAGNA!!!")) {
    message.channel.send("Lasagna sucks. It's all about that fettuccine alfredo!");
	message.channel.send("I'm disappointed");
  }

  if (message.content.includes("hi disappointed, I'm dad")) {
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
    message.reply("There was an error executing that command.").catch(console.error);
  }
});
