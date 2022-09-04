const utility = require('../utility.js')

let running = false;

//let {suggestions, suggestionChannel} = require('../index.js');

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Suggest something to be added to RM!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Suggestion Message')
                .setRequired(true))
        .addAttachmentOption((option)=> option
            .setRequired(false)
            .setName("image")
            .setDescription("Suggestion Image")),
    async execute(client, interaction) {
        const config = client.config;
        await interaction.deferReply({});
        let member = interaction.member;
        while(running) {
            await utility.delay(10); //avoid spamming the channel
        }

        running = true;
        if (interaction.channel.id != config.suggestionsChannel) {
            const exampleEmbed = utility.errorEmbed(`You must use the <#${config.suggestionsChannel}> channel for suggestions!`);
            interaction.followUp({embeds: [exampleEmbed], ephemeral: true});
            return;
        }

        let obj = {
            suggestedBy: interaction.user.id,
            contents: interaction.options.getString("message"),
            votes: {
                upvotes: [],
                downvotes: []
            },
            status: "pending",
            channel: interaction.channel.id,
            arrayIndex: client.suggestions.length,
        };

        let files = false;
        if (interaction.options.getAttachment("image")) files = await interaction.options.getAttachment('image');

        const exampleEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Suggestion #${client.suggestions.length + 1}`)
            .setAuthor({name: interaction.user.tag, iconURL: member.user.displayAvatarURL()})
            .setDescription(interaction.options.getString("message") + "\n\n**Votes**\n⏫ Upvotes: 0\n⏬ Downvotes: 0")
            .setImage(files ? files.url : null)
        const row = new ActionRowBuilder();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`upvote-${client.suggestions.length}`)
                .setLabel("Upvote")
                .setStyle(3)
                .setEmoji('⏫'),
            new ButtonBuilder()
                .setCustomId(`downvote-${client.suggestions.length}`)
                .setLabel("Downvote")
                .setStyle(4)
                .setEmoji('⏬'),
        )

        const msg = await interaction.followUp({embeds: [exampleEmbed], components: [row]});

        obj["msg"] = msg.id;

        const thr = await interaction.channel.threads.create({
            startMessage: msg.id,
            name: `Suggestion ${client.suggestions.length + 1}`,
            autoArchiveDuration: 10080,
            reason: `Created for Suggestion ${client.suggestions.length + 1}`,
            rateLimitPerUser: 5
        });

        obj["thr"] = thr.id;

        client.suggestions.push(obj);
        client.saveSuggestions();

        const logChannel = await client.channels.fetch(config.logsChannel);
        logChannel.send({content: `New suggestion by ${member.user.tag}! Contents: \n${obj.contents}`});

        running = false;
    },
};