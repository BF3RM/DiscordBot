const {Client, Intents, Collection} = require("discord.js");
const Discord = require('discord.js');
const fs = require('node:fs');
const https = require('https')
const config = require("./config.json");
const request = require('request');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.config = config;
client.commands = new Collection();
let categories = [];
exports.categories = categories;

const events = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
for (const file of events) {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null, client));
}

const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commands) {
    const commandName = file.split(".")[0];
    const command = require(`./commands/${file}`);
    if (!categories.includes(command.category)) categories.push(command.category)
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, command);
    console.log(`Loaded command ${commandName}`)
}

client.on('interactionCreate', async i => {
    if (!i.isButton()) return;

    if (i.customId.includes("help")) {
        for (let key in categories) {
            if (i.customId === `help-${categories[key]}`) {
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTimestamp()
                    .setFooter({text: 'Hyperity'})
                    .setAuthor({
                        name: 'Hyperity',
                        iconURL: 'https://i.imgur.com/qCWqGFx.png',
                        url: 'https://hyperity.ml'
                    })
                let cmdcount = 0;
                client.commands.map((c) => {
                    if (c.category == categories[key]) {
                        let name = c.args != "" ? "!" + c.name + " [" + c.args + "]" : "!" + c.name;
                        exampleEmbed.addField(name, c.description, true)
                        cmdcount++
                    }
                })
                exampleEmbed.setDescription(`Hyperity ${categories[key]} commands (${cmdcount})`)
                if (cmdcount == 0) {
                    exampleEmbed.addField("None", "There are no commands in this category.", true)
                }
                i.reply({embeds: [exampleEmbed], components: [], ephemeral: true});
            }
        }
    }
    if (i.customId.includes("dadjoke-next")) {
        i.deferReply();
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
            i.message.edit({embeds: [exampleEmbed], components: [row]});
            i.deleteReply();
        });
    }
});

exports.commands = client.commands;
console.log("Ready")

client.login(config.token);