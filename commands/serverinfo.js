const utility = require('../utility.js')

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

let servers = [
    {
        name: '[BF3:RM] [EU] Test Server #1',
        maxPlayers: 80,
        players: 123,
        currentMap: 'Gulf of Oman',
        health: '182 FPS',
        duration: '1:00',
        activeTime: '1:00',},
    {
        name: '[BF3:RM] [EU] Test Server #2',
        maxPlayers: 80,
        players: 42,
        currentMap: 'Sabalan Pipeline',
        health: '112 FPS',
        duration: '4:20',
        activeTime: '1:30',},
    {
        name: '[BF3:RM] [EU] Test Server #3',
        maxPlayers: 80,
        players: 266,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
    {
        name: '[BF3:RM] [EU] Test Server 3',
        maxPlayers: 80,
        players: 23,
        currentMap: 'Azadi Palace',
        health: '134 FPS',
        duration: '4:60',
        activeTime: '1:20',
    },
];


module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Information about a RM server')
        .addStringOption(option =>
            option.setName('name')
                .setDescription("Server name")
                .setRequired(false)),
    async execute(client, interaction) {
        const config = client.config;
        await interaction.deferReply({ephemeral: true});
        let member = interaction.member;
        let int = interaction.options.getString("name");
        if (!int) {
            let embeds = [];
            let sArray = servers;
            sArray.sort((a, b) => a.players > b.players ? -1 : 1);
            sArray.forEach(server => {
                if(embeds.length >= 5) return;
                const exampleEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle(`${server.name}`)
                    .setFields(
                        { name: 'Players', value: `${server.players}/${server.maxPlayers}`, inline: true },
                        { name: 'Health', value: `${server.health} FPS`, inline: true },
                        { name: 'Current Map', value: `${server.currentMap}`, inline: true },
                        { name: 'Match Duration', value: `${server.duration}`, inline: true },
                        { name: 'Uptime', value: `${server.activeTime}`, inline: true },
                    )
                    .setTimestamp();
                embeds.push(exampleEmbed);
            })
            if(embeds.length > 0) {
                interaction.editReply({embeds: embeds, content: `Found ${sArray.length} servers, displaying top ${embeds.length} by players.`});
                return;
            }
            if(embeds.length === 0) {
                interaction.editReply({embeds: [utility.errorEmbed("No servers found.")]});
                return;
            }
        }
        else {
            let embeds = [];
            servers.forEach(server => {
                if(!server.name.toLowerCase().includes(int.toLowerCase())) return;
                const exampleEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle(`${server.name}`)
                    .setFields(
                        { name: 'Players', value: `${server.players}/${server.maxPlayers}`, inline: true },
                        { name: 'Health', value: `${server.health} FPS`, inline: true },
                        { name: 'Current Map', value: `${server.currentMap}`, inline: true },
                        { name: 'Match Duration', value: `${server.duration}`, inline: true },
                        { name: 'Uptime', value: `${server.activeTime}`, inline: true },
                    )
                    .setTimestamp();
                embeds.push(exampleEmbed);
            })
            if (embeds.length == 0) {
                interaction.editReply({embeds: [utility.errorEmbed("No servers found.")]});
                return;
            }
            if(embeds.length <= 3) {
                interaction.editReply({embeds: embeds});
                return;
            }
            if(embeds.length > 3) {
                interaction.editReply({embeds: [utility.errorEmbed("Too many servers found with this name.")]});
                return;
            }
        }
    },
};