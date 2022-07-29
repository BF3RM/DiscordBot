const Discord = require('discord.js');
const utility = require('../utility.js')



exports.run = (client, message, args) => {
    const user = message.mentions.users.first();
    const member = message.mentions.members.first();
    if (!user && !member) {
        const exampleEmbed = utility.errorEmbed("You should specify a user!");
        return message.channel.send({embeds: [exampleEmbed]});
    }
    let regdate = new Date(user.createdTimestamp)
    let joindate = new Date(message.member.joinedTimestamp)
    let displayname = message.member.nickname ? `${user.username} (${message.member.nickname})` : user.username;
    const exampleEmbed = utility.defaultEmbed();
    exampleEmbed.setColor(message.member.roles.highest.color)
        .setTitle(`${displayname}'s data`)
        .setAuthor({name: 'Hyperity', iconURL: 'https://i.imgur.com/qCWqGFx.png', url: 'https://hyperity.ml'})
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp()
        .setFooter({text: 'Hyperity'})
        .addField("Registered", `${regdate.getFullYear()}/${regdate.getMonth().toString().padStart(2, "0")}/${regdate.getDate().toString().padStart(2, "0")}`)
        .addField("Joined server", `${joindate.getFullYear()}/${joindate.getMonth().toString().padStart(2, "0")}/${joindate.getDate().toString().padStart(2, "0")}`)

    let roles = "";
    member.roles.cache.map((r) => {
        if (r.name != "@everyone" && r.name != member.roles.highest.name) {
            roles += `${r.name}\n`
        }
    })
    console.log(roles)

    exampleEmbed.addField("Highest role", member.roles.highest.name)
    if(roles) {
        exampleEmbed.addField("Additional roles", roles)
    }

    message.channel.send({embeds: [exampleEmbed]});
}

exports.name = "userinfo";
exports.description = "User information";
exports.args = "user";
exports.category = "general";