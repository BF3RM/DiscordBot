const utility = require('../utility.js')

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edits a suggestion')
        .addNumberOption(option =>
            option.setName('id')
                .setDescription("The ID of the suggestion")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription("The new message")
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription("The new image")
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

        if(interaction.user.id !== suggestion.suggestedBy || !pass) {
            const exampleEmbed = utility.errorEmbed(`You can only edit your own suggestions!`);
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

        const date = new Date();
        const result = date.toISOString().split('T')[0];
        let hours = ("0" + new Date().getHours()).slice(-2)
        let minutes = ("0" + new Date().getMinutes()).slice(-2)
        let seconds = ("0" + new Date().getSeconds()).slice(-2)
        let time = `${hours}:${minutes}:${seconds}`

        let iEmbed = EmbedBuilder.from(sugMsg.embeds[0]);

        iEmbed.setDescription(interaction.options.getString("message") + `\n\n**Votes**\n${votesString}\n\n**Last edit by**\n${interaction.user.tag} at ${result} ${time}`);

        let files = await interaction.options.getAttachment("image");

        if (files) iEmbed.setImage(files.url);
        await sugMsg.edit({embeds: [iEmbed]});

        suggestion.editedBy = interaction.user.tag;
        suggestion.editedAt = `${result} ${time}`;

        client.saveSuggestions();
        const embed = utility.successEmbed("Suggestion edited!");
        await interaction.editReply({embeds: [embed], ephemeral: true});
        const logChannel = await client.channels.fetch(config.logsChannel);
        logChannel.send({content: `Suggestion ${suggestion.arrayIndex+1} edited ${interaction.user.tag}! New contents: ${interaction.options.getString("message")}`});
    },
};
