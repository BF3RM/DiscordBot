const Discord = require('discord.js');
const fs = require('node:fs');

exports.delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

exports.saveSuggestions = () => {
    let { suggestions } = require('./index.js');
    fs.writeFileSync("./suggestions.json", JSON.stringify(suggestions));
}

exports.defaultEmbed = () => {
    return new Discord.MessageEmbed()
        .setColor("#276fff")
        .setTimestamp()
        .setFooter({text: 'Suggestions', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
}

exports.errorEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#7a0015")
        .setTimestamp()
        .setFooter({text: 'Suggestions', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
        .addField("Error", msg)
}

exports.infoEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#276fff")
        .setTimestamp()
        .setFooter({text: 'Suggestions', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
        .addField("Information", msg)
}

exports.successEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#239138")
        .setTimestamp()
        .setFooter({text: 'Suggestions', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
        .addField("Success", msg)
}