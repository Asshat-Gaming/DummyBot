const blacklistModel = require('../schemas/blacklist');
const { MessageEmbed } = require('discord.js');
const { MONGO } = require("../util/DummyBotUtil");

module.exports = {
    name: 'blacklist',
    description: "Block user from using this bot",
    async execute(message, args) {
        if(!MONGO) return message.channel.send('No MongoDB URI was provided. Blacklist system disabled!')
        
        const type = args[0];
        const member = message.mentions.users.first()
        const users = await blacklistModel.find();

        if (!type) {
            return message.channel.send("Please provide a type. Use list, add, or remove.");
        }

        if (args[0] == 'list') {
            if (users.length == 0) {
                return message.channel.send("No one is blacklisted.");
            }

            let datas = []
            users.forEach((data, index) => {
                datas.push(`${index++ + 1} | ${data.username} (${data.userId})`)
            })

            const listEmbed = new MessageEmbed()
                .setAuthor(`Blacklist`, message.client.user.displayAvatarURL())
                .setDescription(datas.join('\n '))
                .setColor('#e5ebda')
                .setTimestamp()

            return message.channel.send(listEmbed)


        }

        if (!member) {
            return message.channel.send("Please tag a member to blacklist.");
        }

        if (member.id === message.client.user.id) {
            return message.channel.send("Please never blacklist a bot.");
        }


        switch (type) {
            case "add": {
                const existing = users.filter((u) => u.userId === member.id)[0];
                if (existing) {
                    return message.channel.send("This user is already blacklisted.");
                }

                const blUser = new blacklistModel({ userId: member.id, username: member.username });

                await blUser.save();

                return message.channel.send("User has been blacklisted.");
                break;
            }
            case "remove": {
                if (users === null) {
                    return message.channel.send("User is not blacklisted.");
                }
                const exists = users.find((u) => u.userId === member.id);
                if (!exists) {
                    return message.channel.send("User is not blacklisted.");
                }

                await blacklistModel.findOneAndDelete({ userId: member.id });
                return message.channel.send("User has been whitelisted.")
                break;
            }
            default: {
                return message.channel.send("Please provide a type. Use list, add, or remove.")
            }
        }
    }
}
