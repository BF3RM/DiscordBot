const config = require("../config.json");
const utility = require('../utility.js')
const fs = require("fs");

let cmdPerSec = 0;

let usedTechSupport = JSON.parse(fs.readFileSync("./usedTechSupport.json", "utf8"));

setInterval(() => {
    cmdPerSec = 0;
}, 1000);

module.exports = async (client, message) => {
    const date = new Date()
    const result = date.toISOString().split('T')[0];
    let hours = ("0" + new Date().getHours()).slice(-2)
    let minutes = ("0" + new Date().getMinutes()).slice(-2)
    let seconds = ("0" + new Date().getSeconds()).slice(-2)
    let time = `${hours}:${minutes}:${seconds}`
    if (message.author.bot) return;
    let dontRemove = false;
    if (message.channel.guild.id != config.guildId) return console.log("Can't.");
    console.log(`[${result} ${time}] [#${message.channel.name} (${message.channel.id})] ${message.author.username}#${message.author.discriminator} (${message.author.id}): ${message.content}`);
    cmdPerSec++;
    if (cmdPerSec > 3) {
        const exampleEmbed = utility.errorEmbed("You are sending too many commands in a second!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }

    let pass = false;

    config.manageRoles.forEach(role => {
        if (message.member._roles.includes(role)) {
            pass = true;
        }
    });

    if (message.member.permissions.has("ADMINISTRATOR")) {
        pass = true;
    }

    if (pass == true) {
        dontRemove = true;
    }

    if (message.channel.id == config.supportChannel) {
        if (usedTechSupport.includes(message.author.id)) return;
        if (pass) {
            usedTechSupport.push(message.author.id);
            fs.writeFileSync("./usedTechSupport.json", JSON.stringify(usedTechSupport));
            return;
        }
        ;

        usedTechSupport.push(message.author.id);
        fs.writeFileSync("./usedTechSupport.json", JSON.stringify(usedTechSupport));

        const exampleEmbed = utility.infoEmbed(`Hello, <@${message.member.user.id}>! Make sure to check out <#${config.solutionsChannel}> for solutions to most technical problems!`);
        await message.reply({embeds: [exampleEmbed]});
        return;
    }

    if (message.channel.id == config.suggestionsChannel) {
        if (!message.content.includes("!suggest") && !message.content.includes("!approve") && !message.content.includes("!deny") && !message.content.includes("!implemented")) {
            if (!dontRemove) {
                const exampleEmbed = utility.errorEmbed("You must use !suggest!");
                let msg = await message.channel.send({embeds: [exampleEmbed]});
                message.delete();
                setTimeout(() => {
                    msg.delete();
                }, 5000);
                return;
            }
        }
    }
    if (message.content.indexOf(client.config.prefix) !== 0) return;
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command);

    if (!cmd) return;
    cmd.run(client, message, args);
};