const utility = require('../utility.js')

const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deny')
        .setDescription('Denies a suggestion')
        .addNumberOption(option =>
            option.setName('id')
                .setDescription("The ID of the suggestion")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription("Reason for denial")
                .setRequired(false)),
    async execute(client, interaction) {
        const config = client.config;
        await interaction.deferReply({ephemeral: true});
        let member = interaction.member;
        if (interaction.channel.id !== config.suggestionsChannel) {
            const exampleEmbed = utility.errorEmbed(`You must use the <#${config.suggestionsChannel}> channel for suggestions!`);
            interaction.editReply({embeds: [exampleEmbed], ephemeral: true});
            return;
        }


        let pass = false;

        config.manageRoles.forEach(role => {
            if (member._roles.includes(role)) {
                pass = true;
            }
        });

        if (member.permissions.has([PermissionsBitField.Flags.Administrator])) {
            pass = true;
        }

        if (pass === false) {
            const exampleEmbed = utility.errorEmbed(`You don't have permission to use this command!`);
            interaction.editReply({embeds: [exampleEmbed], ephemeral: true});
            return;
        }

        if (!interaction.options.getNumber("id")) {
            const exampleEmbed = utility.errorEmbed(`You must specify an ID!`);
            interaction.editReply({embeds: [exampleEmbed], ephemeral: true});
            return;
        }

        let suggestion = client.suggestions[interaction.options.getNumber("id") - 1];
        if (!suggestion) {
            const exampleEmbed = utility.errorEmbed(`That ID does not exist!`);
            interaction.editReply({embeds: [exampleEmbed], ephemeral: true});
            return;
        }

        let channel;
        let sugMsg;

        try {
            channel = await client.channels.fetch(suggestion.channel);
            sugMsg = await channel.messages.fetch(suggestion.msg);
        }
        catch(err) {
            const exampleEmbed = utility.errorEmbed(`Suggestion not found!`);
            interaction.editReply({embeds: [exampleEmbed], ephemeral: true});
            console.log(err);
            return;
        }

        if (suggestion.status !== "pending") {
            const exampleEmbed = utility.errorEmbed(`This suggestion has already been approved or rejected!`);
            interaction.editReply({embeds: [exampleEmbed], ephemeral: true});
            return;
        }

        let reason;
        if (interaction.options.getString("reason")) {
            reason = interaction.options.getString("reason");
        } else {
            reason = "No reason given.";
        }

        let guild = await client.guilds.fetch(config.guildId);
        member = await guild.members.fetch(suggestion.suggestedBy);

        let votesString;
        let upvotesPercent = Math.round((suggestion.votes.upvotes.length / (suggestion.votes.upvotes.length + suggestion.votes.downvotes.length)) * 100);
        let downvotesPercent = Math.round((suggestion.votes.downvotes.length / (suggestion.votes.upvotes.length + suggestion.votes.downvotes.length)) * 100);
        if (suggestion.votes.upvotes.length < suggestion.votes.downvotes.length) {
            votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)\n**⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)**`;
        } else if (suggestion.votes.upvotes.length === 0 && suggestion.votes.downvotes.length === 0) {
            votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} \n⏬ Downvotes: ${suggestion.votes.downvotes.length}`;
        } else if (suggestion.votes.upvotes.length === suggestion.votes.downvotes.length) {
            votesString = `⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)\n⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)`;
        } else {
            votesString = `**⏫ Upvotes: ${suggestion.votes.upvotes.length} (${upvotesPercent}%)**\n⏬ Downvotes: ${suggestion.votes.downvotes.length} (${downvotesPercent}%)`;
        }

        suggestion.description = suggestion.contents + `\n\n**Votes**\n${votesString}\n\n**Denied by**\n${interaction.user.tag}\n**Reason**\n${reason}`

        const exampleEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle(`Suggestion #${suggestion.arrayIndex + 1}`)
            .setAuthor({name: interaction.user.tag, iconURL: member.user.displayAvatarURL()})
            .setDescription(suggestion.description)
            .setImage(sugMsg.embeds[0].data.image ? sugMsg.embeds[0].data.image.url : null)

        let final = await client.channels.fetch(config.finalChannel);

        const msg = await final.send({embeds: [exampleEmbed]});

        try {
            let sugThr = channel.threads.cache.find(x => x.name === `Suggestion ${suggestion.arrayIndex+1}`);
            await sugThr.send({embeds: [exampleEmbed]});
            await sugThr.setArchived(true);
            await sugThr.setLocked(true);
        }
        catch (e) {
            console.log(`Error while handling thread: ${e.stack}`);
        }

        suggestion.msg = msg.id;
        suggestion.status = "denied";
        suggestion.deniedBy = interaction.user.tag;
        suggestion.denyReason = reason;
        suggestion.channel = config.finalChannel;

        client.saveSuggestions();
        const embed = utility.successEmbed("Suggestion denied!");
        await interaction.editReply({embeds: [embed], ephemeral: true});
        await member.send({embeds: [exampleEmbed]});
        const logChannel = await client.channels.fetch(config.logsChannel);
        logChannel.send({content: `Suggestion ${suggestion.arrayIndex+1} denied by ${interaction.user.tag}! Reason: ${reason}`});
        await sugMsg.delete();
    },
};

/*
exports.run = async (client, message, ...args) => {

}

exports.name = "approve";
exports.description = "Approve a feature";
exports.args = "[message]";
exports.category = "suggestions";*/