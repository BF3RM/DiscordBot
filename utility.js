const Discord = require('discord.js');

exports.defaultEmbed = () => {
    return new Discord.MessageEmbed()
        .setColor("#276fff")
        .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
        .setTimestamp()
        .setFooter({text: 'Hyperity'})
}

exports.errorEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#7a0015")
        .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
        .setTimestamp()
        .setFooter({text: 'Hyperity'})
        .addField("Error", msg)
}

exports.infoEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#276fff")
        .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
        .setTimestamp()
        .setFooter({text: 'Hyperity'})
        .addField("Information", msg)
}

exports.successEmbed = (msg) => {
    return new Discord.MessageEmbed()
        .setColor("#239138")
        .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
        .setTimestamp()
        .setFooter({text: 'Hyperity'})
        .addField("Success", msg)
}