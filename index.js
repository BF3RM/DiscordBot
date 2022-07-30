const {Client, Intents, Collection} = require("discord.js");
const Discord = require('discord.js');
const fs = require('node:fs');
const config = require("./config.json");
const suggestionChannel = config.suggestionsChannel;
const finalChannel = config.finalChannel;
const manageRoles = config.manageRoles;
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
const utility = require('./utility.js');

client.config = config;
client.commands = new Collection();
let categories = [];
exports.categories = categories;
exports.suggestionChannel = suggestionChannel;
exports.finalChannel = finalChannel;
exports.manageRoles = manageRoles;

function ensureExists(path, ifNotExists="") {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, ifNotExists)
        console.log(`${path} created!`)
    }
}

ensureExists("./suggestions.json", JSON.stringify([]));
ensureExists("./usedTechSupport.json", JSON.stringify([]));

let suggestions = JSON.parse(fs.readFileSync("./suggestions.json", "utf8"));
exports.suggestions = suggestions;

const events = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of events) {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null, client));
}

const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commands) {
    const commandName = file.split(".")[0];
    const command = require(`./commands/${file}`);
    if (!categories.includes(command.category)) categories.push(command.category)
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, command);
    console.log(`Loaded command ${commandName}`)
}

client.on('interactionCreate', async i => {
    if (!i.isButton()) return;
    if (i.customId.includes("vote")) {
        await i.deferReply({
            ephemeral: true
        });
        let index = i.customId.split("-")[1];
        let suggestion = suggestions[index];
        let replyEmbed;

        let vote = i.customId.split("-")[0];
        vote = vote.charAt(0).toUpperCase() + vote.slice(1);

        if (suggestion.suggestedBy == i.user.id) {
            replyEmbed = utility.errorEmbed(`You cannot vote on your own suggestion.`);
            return i.editReply({embeds: [replyEmbed]})
        }

        if (suggestion.votes.upvotes.includes(i.user.id) || suggestion.votes.downvotes.includes(i.user.id)) {
            let vote = suggestion.votes.upvotes.includes(i.user.id) ? "Upvote" : "Downvote";
            replyEmbed = utility.errorEmbed(`You have already voted on this suggestion (${vote}).`);
            return i.editReply({embeds: [replyEmbed]})
        }

        let guild = await client.guilds.fetch(config.guildId);
        let member = await guild.members.fetch(suggestion.suggestedBy);

        let displayname = member.nickname ? `${member.user.username}#${member.user.discriminator} (${member.nickname})` : `${member.user.username}#${member.user.discriminator}`;

        let embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Suggestion #${suggestion.arrayIndex + 1}`)
            .setAuthor({name: displayname, iconURL: member.user.displayAvatarURL()})
            .setTimestamp()
            .setFooter({text: 'Suggestions', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})

        if (i.customId.includes("upvote")) {
            suggestion.votes.upvotes.push(i.user.id);
        } else {
            suggestion.votes.downvotes.push(i.user.id);
        }
        let votesString = "";
        let upvotesPercent = Math.round((suggestion.votes.upvotes.length / (suggestion.votes.upvotes.length + suggestion.votes.downvotes.length)) * 100);
        let downvotesPercent = Math.round((suggestion.votes.downvotes.length / (suggestion.votes.upvotes.length + suggestion.votes.downvotes.length)) * 100);
        if (suggestion.votes.upvotes.length < suggestion.votes.downvotes.length) {
            votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)\n**⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)**`;
        } else if (suggestion.votes.upvotes.length == suggestion.votes.downvotes.length) {
            votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)\n⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)`;
        } else {
            votesString = `**⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)**\n⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)`;
        }
        embed.setDescription(suggestion.contents + `\n\n**Votes**\n${votesString}`);
        let channel = await client.channels.fetch(suggestion.channel);
        let msg = await channel.messages.fetch(suggestion.msg)
        msg.edit({embeds: [embed]});
        replyEmbed = utility.successEmbed(`${vote} added.\n\n**Votes**\n` + votesString);
        i.editReply({embeds: [replyEmbed]});
        utility.saveSuggestions();
    }
});


exports.commands = client.commands;

process.on('uncaughtException', async (err) => {
    console.error('[EXCEPTION] ' + err.stack);
    const logChannel = await client.channels.fetch(config.logsChannel);
    logChannel.send({content: `<@229988858874298368> [EXCEPTION]:`+"```"+`${err.stack}`+"```"});
});

process.on('unhandledRejection', async (err) => {
    console.error('[PROMISE]: ' + err.stack);
    const logChannel = await client.channels.fetch(config.logsChannel);
    logChannel.send({content: `<@229988858874298368> [PROMISE]:`+"```"+`${err.stack}`+"```"});
})


client.login(config.token).then(() => {
    console.log(`Logged in. `);
});