const Discord = require('discord.js');
const utility = require('../utility.js')
const request = require('request');

exports.run = async (client, message, args) => {

    request('https://icanhazdadjoke.com', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Hyperity')
            .setURL('https://hyperity.ml')
            .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
            .addField("Dad Jokes", body.joke)
            .setTimestamp()
            .setFooter({text: 'Hyperity'})
        const row = new Discord.MessageActionRow();
        row.addComponents(
            new Discord.MessageButton()
                .setCustomId(`dadjoke-next`)
                .setLabel("New joke ➡️")
                .setStyle('SUCCESS')
        )
        message.channel.send({embeds: [exampleEmbed], components: [row]});
    });
}

exports.name = "dadjoke";
exports.description = "Dad Jokes";
exports.category = "fun";
