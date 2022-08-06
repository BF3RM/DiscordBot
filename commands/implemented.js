const utility = require('../utility.js')

const { SlashCommandBuilder, PermissionsBitField, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('implemented')
        .setDescription('Implements a suggestion')
        .addNumberOption(option =>
            option.setName('id')
                .setDescription("The ID of the suggestion")
                .setRequired(true)),
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

        if (suggestion.status !== "approved") {
            const exampleEmbed = utility.errorEmbed(`This suggestion is not approved!`);
            interaction.editReply({embeds: [exampleEmbed], ephemeral: true});
            return;
        }

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

        let iEmbed = sugMsg.embeds[0];

        iEmbed.data.description = iEmbed.data.description + `\n\n**Implemented by**\n${interaction.user.tag}`
        iEmbed.data.color = Colors.Grey;

        suggestion.status = "implemented";
        suggestion.implementedBy = interaction.user.tag;

        await member.send({embeds: [iEmbed]});
        await sugMsg.edit({embeds: [iEmbed]});

        suggestion.status = "implemented";
        suggestion.implementedBy = interaction.user.tag;
        suggestion.channel = config.finalChannel;

        client.saveSuggestions();
        const embed = utility.successEmbed("Suggestion implemented!");
        await interaction.editReply({embeds: [embed], ephemeral: true});
        const logChannel = await client.channels.fetch(config.logsChannel);
        logChannel.send({content: `Suggestion ${suggestion.arrayIndex+1} implemented by ${interaction.user.tag}!`});
    },
};