const Discord = require('discord.js');

let {categories} = require('../index.js');
exports.run = (client, message, args) => {
    //message.followUp({content: "asd", ephemeral: true});

    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Hyperity')
        .setURL('https://hyperity.ml')
        .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
        .setDescription('Hyperity is a multi-functional Discord Bot, written in NodeJS to deliver the best performance.')
        .setTimestamp()
        .setFooter({text: 'Hyperity'})
    const row = new Discord.MessageActionRow();
    for (let key in categories) {
        row.addComponents(
            new Discord.MessageButton()
                .setCustomId(`help-${categories[key]}`)
                .setLabel(categories[key].charAt(0).toUpperCase() + categories[key].slice(1))
                .setStyle('PRIMARY')
        )
    }
    message.channel.send({embeds: [exampleEmbed], components: [row]});
}

exports.name = "help";
exports.description = "List all commands";
exports.args = "";
exports.category = "general";