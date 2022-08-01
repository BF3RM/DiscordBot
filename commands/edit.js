const Discord = require('discord.js');
const utility = require('../utility.js')
const config = require("../config.json");

let {suggestions, suggestionChannel, manageRoles} = require('../index.js');

exports.run = async (client, message, ...args) => {
    if (message.channel.id != suggestionChannel) {
        const exampleEmbed = utility.errorEmbed(`You must use the <#${suggestionChannel}> channel for suggestions!`);
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        running = false;
        return;
    }

    let pass = false;

    manageRoles.forEach(role => {
        if (message.member._roles.includes(role)) {
            pass = true;
        }
    });

    if (message.member.permissions.has("ADMINISTRATOR")) {
        pass = true;
    }

    if (args[0].length == 0) {
        const exampleEmbed = utility.errorEmbed("You must specify an ID!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    let suggestion = suggestions[args[0][0] - 1];
    if (!suggestion) {
        const exampleEmbed = utility.errorEmbed("That ID does not exist!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    try {
        let channel = await client.channels.fetch(suggestion.channel);
        let sugMsg = await channel.messages.fetch(suggestion.msg);
    } catch (err) {
        const exampleEmbed = utility.errorEmbed("Suggestion not found!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    if (suggestion.suggestedBy != message.author.id || !pass) {
        const exampleEmbed = utility.errorEmbed("You can't edit this suggestion!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    if (suggestion.status != "pending") {
        const exampleEmbed = utility.errorEmbed("This suggestion has already been approved or rejected!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    suggestion.contents = args[0].join(" ");

    let guild = await client.guilds.fetch(config.guildId);
    let member = await guild.members.fetch(suggestion.suggestedBy);

    let displayname = member.nickname ? `${member.user.username}#${member.user.discriminator} (${member.nickname})` : `${member.user.username}#${member.user.discriminator}`;

    let msgembed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Suggestion #${suggestion.arrayIndex + 1}`)
        .setAuthor({name: displayname, iconURL: member.user.displayAvatarURL()})
        .setTimestamp()
        .setFooter({
            text: 'Last Updated',
        })

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

    msgembed.setDescription(suggestion.contents + `\n\n**Votes**\n${votesString}`);
    let channel = await client.channels.fetch(suggestion.channel);
    let msg = await channel.messages.fetch(suggestion.msg)
    msg.edit({embeds: [msgembed]});

    message.delete();
    utility.saveSuggestions();
    const embed = utility.successEmbed("Suggestion edited!");
    let msg2 = await message.channel.send({embeds: [embed]});
    await member.send({embeds: [exampleEmbed]});
    const logChannel = await client.channels.fetch(config.logsChannel);
    logChannel.send({content: `Suggestion ${suggestion.arrayIndex + 1} edited by ${message.author.tag}! New contents: ${suggestion.contents}`});
    sugMsg.delete();
    setTimeout(() => {
        msg2.delete();
    }, 5000);
}

exports.name = "edit";
exports.description = "Edit a suggestion";
exports.args = "[message]";
exports.category = "suggestions";