const Discord = require('discord.js');
const fs = require('node:fs');
const { EmbedBuilder } = require('discord.js');

exports.delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

exports.defaultEmbed = () => {
    return new EmbedBuilder()
        .setColor("#276fff")
        .setTimestamp()
        .setFooter({text: 'Reality Mod', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
}

exports.errorEmbed = (msg) => {
    return new EmbedBuilder()
        .setColor("Red")
        .setTimestamp()
        .setFooter({text: 'Reality Mod', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
        .addFields({name: "Error", value: msg})
}

exports.infoEmbed = (msg) => {
    return new EmbedBuilder()
        .setColor("Blue")
        .setTimestamp()
        .setFooter({text: 'Reality Mod', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
        .addFields({name: "Information", value: msg})
}

exports.successEmbed = (msg) => {
    return new EmbedBuilder()
        .setColor("Green")
        .setTimestamp()
        .setFooter({text: 'Reality Mod', iconURL: "https://cdn.discordapp.com/icons/319035622100566017/a_5aeeef7eb99344d68afe62bf451de986.png?size=1024"})
        .addFields({name: "Success", value: msg})
}