const config = require("../config.json");
const utility = require('../utility.js')

let cmdPerSec = 0;

setInterval(() => { cmdPerSec = 0; }, 1000);

module.exports = async (client, message) => {
    //console.log(message);
    cmdPerSec++;
    if(cmdPerSec > 3) {
        const exampleEmbed = utility.errorEmbed("You are sending too many commands in a second!");
        let msg = await message.channel.send({embeds: [exampleEmbed]});
        message.delete();
        setTimeout(() => {
            msg.delete();
        }, 5000);
        return;
    }
    if (message.author.bot) return;
    if (message.content.indexOf(client.config.prefix) !== 0) return;
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command);
    if (message.channel.id == config.suggestionChannel) {
        if (!message.includes("!suggest")) {
            const exampleEmbed = utility.errorEmbed("You should use the #suggest channel for suggestions!");
            let msg = await message.channel.send({embeds: [exampleEmbed]});
            message.delete();
            setTimeout(() => {
                msg.delete();
            }, 5000);
            return;
        }
    }


    if (!cmd) return;
    cmd.run(client, message, args);
};