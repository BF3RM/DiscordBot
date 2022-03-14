const Discord = require('discord.js');
const utility = require('../utility.js')
const request = require('request');

exports.run = async (client, message, args) => {
    const user = message.mentions.users.first();
    const member = message.mentions.members.first();
    if (!user && !member) {
        const exampleEmbed = utility.errorEmbed("You should specify a user!");
        return message.channel.send({embeds: [exampleEmbed]});
    }
    let displayname = message.member.nickname ? `${user.username} (${message.member.nickname})` : user.username;
    let cperc = Math.round(Math.random() * (100))
        const exampleEmbed = new Discord.MessageEmbed()
            .setTitle('Hyperity')
            .setURL('https://hyperity.ml')
            .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
            .setDescription(`${displayname} has ${cperc}% COVID!`)
            .setTimestamp()
            .setFooter({text: 'Hyperity'})

        if(cperc > 10) {
            exampleEmbed.setColor('#FF0000').addField(`Result`, `bro u should really visit a doc or smth`)
        }
    else {
            exampleEmbed.setColor('#FF074').addField(`Result`, `you are fine as hell buddy, take care`)
        }
        message.channel.send({embeds: [exampleEmbed]});
    }

exports.name = "covid";
exports.description = "Covid meter";
exports.args = "user"
exports.category = "fun";