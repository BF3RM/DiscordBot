const Discord = require('discord.js');
const utility = require('../utility.js')

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

let running = false;

let {suggestions, suggestionChannel, saveSuggestions} = require('../index.js');

exports.run = async (client, message, ...args) => {
    while(running) {
        await delay(10);
    }

    running = true;
    if (message.channel.id != suggestionChannel) {
        if (args[0].length == 0) {
            const exampleEmbed = utility.errorEmbed("You should use #suggest channel for suggestions!");
            let msg = await message.channel.send({embeds: [exampleEmbed]});
            message.delete();
            setTimeout(() => {
                msg.delete();
            }, 5000);
            running = false;
            return;
        }
    }
    let displayname = message.member.nickname ? `${message.member.user.username}#${message.member.user.discriminator} (${message.member.nickname})` : `${message.member.user.username}#${message.member.user.discriminator}`;
    let obj = {
        suggestedBy: message.member.user.id.toString(),
        contents: args[0].join(" "),
        votes: {
            upvotes: [],
            downvotes: []
        },
        status: "pending",
        channel: message.channel.id,
        arrayIndex: suggestions.length,
    };

    if (args[0].length == 0) {
        const exampleEmbed = utility.errorEmbed("Suggestion cannot be empty!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        running = false;
        return;
    }

    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Suggestion #${suggestions.length + 1}`)
        .setAuthor({name: displayname, iconURL: message.member.user.displayAvatarURL()})
        .setDescription(args[0].join(" ") + "\n\n**Votes**\n⏫ Upvotes: 0\n\n⏬ Downvotes: 0")
        .setTimestamp()
        .setFooter({text: 'Suggestions', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
    const row = new Discord.MessageActionRow();
    row.addComponents(
        new Discord.MessageButton()
            .setCustomId(`upvote-${suggestions.length}`)
            .setLabel("Upvote")
            .setStyle('SUCCESS')
            .setEmoji('⏫'),
        new Discord.MessageButton()
            .setCustomId(`downvote-${suggestions.length}`)
            .setLabel("Downvote")
            .setStyle('DANGER')
            .setEmoji('⏬'),
    )

    let files = await Array.from(message.attachments.values());

    const msg = await message.channel.send({embeds: [exampleEmbed], components: [row]});

    obj["msg"] = msg.id;

    const thr = await message.channel.threads.create({
        startMessage: msg.id,
        name: `Suggestion ${suggestions.length + 1}`,
        autoArchiveDuration: 60,
        reason: 'Created for Suggestion #1',
    });

    if(files.length > 0) {
        await thr.send({content: "Attached files", files: files});
    }

    obj["thr"] = thr.id;

    suggestions.push(obj);
    message.delete();
    utility.saveSuggestions();
    running = false;
}

exports.name = "suggest";
exports.description = "Suggest a feature";
exports.args = "[message]";
exports.category = "suggestions";