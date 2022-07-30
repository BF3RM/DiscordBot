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

    if (pass == false) {
        const exampleEmbed = utility.errorEmbed("You do not have permission to use this command!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
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
    }
    catch(err) {
        const exampleEmbed = utility.errorEmbed("Suggestion not found!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    if (suggestion.status != "approved") {
        const exampleEmbed = utility.errorEmbed("This suggestion is not approved!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    let guild = await client.guilds.fetch(config.guildId);
    let member = await guild.members.fetch(suggestion.suggestedBy);

    let displayname = member.nickname ? `${member.user.username}#${member.user.discriminator} (${member.nickname})` : `${member.user.username}#${member.user.discriminator}`;

    let embed = new Discord.MessageEmbed()
        .setColor("GREY")
        .setTitle(`Suggestion #${suggestion.arrayIndex + 1}`)
        .setAuthor({name: displayname, iconURL: member.user.displayAvatarURL()})
        .setTimestamp()
        .setFooter({text: 'Suggestions', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})

    embed.setDescription(suggestion.description + `\n\n**Implemented by**\n${displayname}`)
    embed.setColor("GREY")

    suggestion.status = "implemented";

    suggestion.implementedBy = displayname;

    await member.send({embeds: [embed]});

    let channel = await client.channels.fetch(suggestion.channel);
    let sugMsg = await channel.messages.fetch(suggestion.msg);
    sugMsg.edit({embeds: [embed]});

    message.delete();
    utility.saveSuggestions();
    const logChannel = await client.channels.fetch(config.logsChannel);
    logChannel.send({content: `Suggestion ${suggestion.arrayIndex+1} implemented by ${displayname}!`});
    const embed1 = utility.successEmbed("Suggestion implemented!");
    let msg2 = await message.channel.send({embeds: [embed1]});
    setTimeout(() => {
        msg2.delete();
    }, 5000);
}

exports.name = "implemented";
exports.description = "Implemented a feature";
exports.args = "[message]";
exports.category = "suggestions";