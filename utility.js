const Discord = require('discord.js');
const fs = require('node:fs');


exports.saveSuggestions = () => {
    let { suggestions } = require('./index.js');
    fs.writeFileSync("./suggestions.json", JSON.stringify(suggestions));
}

exports.defaultEmbed = () => {
    return new Discord.MessageEmbed()
        .setColor("#276fff")
        .setTimestamp()
        .setFooter({text: 'Suggestions'})
}

exports.errorEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#7a0015")
        .setTimestamp()
        .setFooter({text: 'Suggestions'})
        .addField("Error", msg)
}

exports.infoEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#276fff")
        .setTimestamp()
        .setFooter({text: 'Suggestions'})
        .addField("Information", msg)
}

exports.successEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#239138")
        .setTimestamp()
        .setFooter({text: 'Suggestions'})
        .addField("Success", msg)
}