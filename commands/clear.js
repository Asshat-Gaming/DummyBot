module.exports = {
    name: "clear",
    description: "Clears messages from a channel",

	async execute(message, args) {

        const amount = args.join(" ");

        if(!amount) return message.reply('Please provide the number of messages you wish to delete.')

        if(amount > 100) return message.reply(`You cannot clear more than 100 messages at once.`)

        if(amount < 1) return message.reply(`You need to delete at least one message.`)

        await message.channel.messages.fetch({limit: amount}).then(messages => {
			if ((message.member.roles.cache.find(r => r.name === "Moderator (Discord)")) || (message.member.roles.cache.find(r => r.name === "Administrator (Discord)")) || (message.member.roles.cache.find(r => r.name === "Manager (Discord)")) || (message.member.roles.cache.find(r => r.name === "Division Leader (Discord)")) || (message.member.roles.cache.find(r => r.name === "Community Leader")) || (message.member.roles.cache.find(r => r.name === "Server Owner"))) {
				const notPinned = messages.filter(fetchedMsg => !fetchedMsg.pinned);
				message.channel.bulkDelete(notPinned, true);
				return message.channel.send('Messages cleared successfully.').catch(console.error);
			}
			else
			message.channel.send('You do not have permission to use this command.').catch(console.error);
    });
    }
};