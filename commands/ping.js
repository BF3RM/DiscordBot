const Discord = require('discord.js');
const utility = require('../utility.js')

exports.run = (client, message, args) => {
    let ms = 0;
    let msintv = setInterval(()=>{
        ms++;
    }, 0)
    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Hyperity')
        .setURL('https://hyperity.ml')
        .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
        .setDescription(`Pong!\nLatency: ${ms}ms`)
        .setTimestamp()
        .setFooter({text: 'Hyperity'})

    clearInterval(msintv);
    message.channel.send({embeds: [exampleEmbed]});
}

exports.name = "ping";
exports.description = "pong";
exports.args = "";
exports.category = "general";