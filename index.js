const {Client, GatewayIntentBits, Partials, Collection, InteractionType, EmbedBuilder, ActivityType} = require('discord.js');
const fs = require('node:fs');
const os = require('os');
const config = require("./config.json");
const client = new Client({intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel]});
const utility = require('./utility.js');
const crypto = require('crypto');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v10');
const {token} = require('./config.json');
client.saveSuggestions = () => {
    fs.writeFileSync("./suggestions.json", JSON.stringify(client.suggestions));
}

function generateChecksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

client.config = config;
client.commands = new Collection();
let categories = [];
exports.categories = categories;

function ensureExists(path, ifNotExists = "") {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, ifNotExists)
        console.log(`${path} created!`)
    }
}

ensureExists("./suggestions.json", JSON.stringify([]));
ensureExists("./usedTechSupport.json", JSON.stringify([]));

client.suggestions = JSON.parse(fs.readFileSync("./suggestions.json", "utf8"));

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
    try {
        client.commands.set(command.data.name, command);
        console.log(`Command ${commandName} loaded!`);
    } catch (e) {
        console.log(`Error loading command ${commandName}: ${e.stack}`);
    }
}

client.on('interactionCreate', async i => {
    console.log(`Interaction by ${i.user.tag} received! (${i.type})`);
    if (i.type === InteractionType.ApplicationCommand) {
        const command = client.commands.get(i.commandName);

        if (!command) return;

        try {
            await command.execute(client, i);
        } catch (error) {
            console.error(error);
        }
    }

    if (!i.isButton()) return;
    if (i.customId.includes("vote")) {
        await i.deferReply({
            ephemeral: true
        });
        let index = i.customId.split("-")[1];
        let suggestion = client.suggestions[index];
        let replyEmbed;

        let vote = i.customId.split("-")[0];
        vote = vote.charAt(0).toUpperCase() + vote.slice(1);

        if (suggestion.suggestedBy === i.user.id) {
             replyEmbed = utility.errorEmbed(`You cannot vote on your own suggestion.`);
             return i.editReply({embeds: [replyEmbed]})
        }

        if (suggestion.votes.upvotes.includes(i.user.id) || suggestion.votes.downvotes.includes(i.user.id)) {
            let vote = suggestion.votes.upvotes.includes(i.user.id) ? "Upvote" : "Downvote";
            replyEmbed = utility.errorEmbed(`You have already voted on this suggestion (${vote}).`);
            return i.editReply({embeds: [replyEmbed]})
        }

        let channel = await client.channels.fetch(suggestion.channel);
        let msg = await channel.messages.fetch(suggestion.msg)

        let embed = EmbedBuilder.from(msg.embeds[0]);

        if (i.customId.includes("upvote")) {
            suggestion.votes.upvotes.push(i.user.id);
        } else {
            suggestion.votes.downvotes.push(i.user.id);
        }
        let votesString;
        let upvotesPercent = Math.round((suggestion.votes.upvotes.length / (suggestion.votes.upvotes.length + suggestion.votes.downvotes.length)) * 100);
        let downvotesPercent = Math.round((suggestion.votes.downvotes.length / (suggestion.votes.upvotes.length + suggestion.votes.downvotes.length)) * 100);
        if (suggestion.votes.upvotes.length < suggestion.votes.downvotes.length) {
            votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)\n**⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)**`;
        } else if (suggestion.votes.upvotes.length === suggestion.votes.downvotes.length) {
            votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)\n⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)`;
        } else {
            votesString = `**⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)**\n⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)`;
        }
        if(suggestion.editedBy) {
            embed.setDescription(suggestion.contents + `\n\n**Votes**\n${votesString}\n\n**Last edit by**\n${suggestion.editedBy} at ${suggestion.editedAt}`);
        }
        else {
            embed.setDescription(suggestion.contents + `\n\n**Votes**\n${votesString}`);
        }
        embed.setFooter({text: "Last Updated"});
        embed.setTimestamp();
        msg.edit({embeds: [embed]});
        replyEmbed = utility.successEmbed(`${vote} added.\n\n**Votes**\n` + votesString);
        i.editReply({embeds: [replyEmbed]});
        client.saveSuggestions();
    }
});


exports.commands = client.commands;

process.on('uncaughtException', async (err) => {
    console.error('[EXCEPTION] ' + err.stack);
    const logChannel = await client.channels.fetch(config.logsChannel);
    logChannel.send({content: `<@229988858874298368> [EXCEPTION]:` + "```" + `${err.stack}` + "```"});
});

process.on('unhandledRejection', async (err) => {
    console.error('[PROMISE]: ' + err.stack);
    const logChannel = await client.channels.fetch(config.logsChannel);
    logChannel.send({content: `<@229988858874298368> [PROMISE]:` + "```" + `${err.stack}` + "```"});
})


client.login(config.token).then(async () => {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({version: '10'}).setToken(token);

    try {
        console.log('Started refreshing application commands.');

        await rest.put(
            Routes.applicationGuildCommands(client.config.clientId, client.config.guildId),
            {body: commands},
        );

        console.log('Successfully reloaded application commands.');
    } catch (error) {
        console.log("Error while reloading application commands.")
        console.error(error);
        process.exit(0);
    }

    let checksums = "";
    let pass = false;
    const files = await fs.readdirSync("./");
    for (const file of files) {
        if (file.endsWith(".js")) {
            checksums += fs.statSync(`./${file}`).size;
        } else if (fs.lstatSync(file).isDirectory()) {
            const files = await fs.readdirSync(`./${file}`);
            let folder = file;
            for (const file of files) {
                if (folder === "node_modules") break;
                else if (file.endsWith(".js")) {
                    checksums += fs.statSync(`./${folder}/${file}`).size;
                }
            }
        }
    }
    let checksumLength;
    setInterval(() => {
        if (checksumLength === checksums.length) {
            pass = true;
        }
    }, 1000)
    while (!pass) {
        checksumLength = checksums.length;
        await utility.delay(10);
    }
    const logChannel = await client.channels.fetch(config.logsChannel);
    logChannel.send({content: `<@229988858874298368> bot logged in from ${os.hostname()}. Version: ${generateChecksum(checksums)}`});
    console.log(`Logged in. Version: ${generateChecksum(checksums)}`);
});