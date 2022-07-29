const Discord = require('discord.js');
const utility = require('../utility.js')
const { PermissionsBitField } = require('discord.js');
const config = require("../config.json");


let {suggestions, finalChannel, saveSuggestions, suggestionChannel, manageRoles} = require('../index.js');

exports.run = async (client, message, ...args) => {
    if(message.channel.id != suggestionChannel) {
        if(args[0].length == 0) {
            const exampleEmbed = utility.errorEmbed("You should use #suggest channel for suggestions!");
            let msg = await message.channel.send({embeds: [exampleEmbed]});
            message.delete();
            setTimeout(() => {
                msg.delete();
            }, 5000);
            return;
        }
    }

    let pass = false;

    manageRoles.forEach(role => {
        if(message.member._roles.includes(role)) {
            pass = true;
        }
    });

    if (message.member.permissions.has("ADMINISTRATOR")) {
        pass = true;
    }

    if(pass == false) {
        const exampleEmbed = utility.errorEmbed("You do not have permission to use this command!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    if(args[0].length == 0) {
        const exampleEmbed = utility.errorEmbed("You must specify an ID!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    let suggestion = suggestions[args[0][0]-1];
    if(!suggestion) {
        const exampleEmbed = utility.errorEmbed("That ID does not exist!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    if(suggestion.status != "pending") {
        const exampleEmbed = utility.errorEmbed("This suggestion has already been approved or rejected!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    let reason;
    if(args[0][1]) {
        args[0].shift()
        reason = args[0].join(" ");
    }
    else {
        reason = "No reason given.";
    }

    let guild = await client.guilds.fetch(config.guildId);
    let member = await guild.members.fetch(suggestion.suggestedBy);


    let displayname = member.nickname ? `${member.user.username}#${member.user.discriminator} (${member.nickname})` : `${member.user.username}#${member.user.discriminator}`;

    let upvotesPercent = Math.round((suggestion.votes.upvotes.length / (suggestion.votes.upvotes.length + suggestion.votes.downvotes.length)) * 100);
    let downvotesPercent = Math.round((suggestion.votes.downvotes.length / (suggestion.votes.upvotes.length + suggestion.votes.downvotes.length)) * 100);
    if(suggestion.votes.upvotes.length < suggestion.votes.downvotes.length) {
        votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)\n\n**⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)**`;
    }
    else if (suggestion.votes.upvotes.length == 0 && suggestion.votes.downvotes.length == 0) {
        votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} \n\n⏬ Downvotes: ${suggestion.votes.downvotes.length}`;
    }
    else if (suggestion.votes.upvotes.length == suggestion.votes.downvotes.length) {
        votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)\n\n⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)`;
    }
    else {
        votesString = `**⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)**\n\n⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)`;
    }

    suggestion.description = suggestion.contents+`\n\n**Votes**\n${votesString}\n\n**Denied by**\n${displayname}\n**Reason**\n${reason}`

    const exampleEmbed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle(`Suggestion #${suggestion.arrayIndex+1}`)
        .setAuthor({name: displayname, iconURL: member.user.displayAvatarURL()})
        .setDescription(suggestion.description)
        .setTimestamp()
        .setFooter({text: 'Suggestions', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})

    let final = await client.channels.fetch(finalChannel);

    let channel = await client.channels.fetch(suggestion.channel);
    let sugMsg = await channel.messages.fetch(suggestion.msg);

    const msg = await final.send({embeds: [exampleEmbed]});

    let sugThr = channel.threads.cache.find(x => x.name === `Suggestion ${suggestion.arrayIndex+1}`);
    await sugThr.send({embeds: [exampleEmbed]});
    await sugThr.setArchived(true);

    suggestion.msg = msg.id;
    suggestion.status = "denied";
    suggestion.approvedBy = displayname;
    suggestion.approveReason = reason;
    suggestion.channel = finalChannel;

    message.delete();
    utility.saveSuggestions();
    const embed = utility.successEmbed("Suggestion denied!");
    let msg2 = await message.channel.send({embeds: [embed]});
    await member.send({embeds: [exampleEmbed]});
    sugMsg.delete();
    setTimeout(() => {
        msg2.delete();
    }, 5000);
}

exports.name = "deny";
exports.description = "Deny a feature";
exports.args = "[message]";
exports.category = "suggestions";