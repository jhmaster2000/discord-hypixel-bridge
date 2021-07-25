import { createBot } from 'mineflayer';
import { Client, WebhookClient, RichEmbed } from 'discord.js';
import { useWebhook, mentionEveryone, memberRole, prefix } from './config/config.json';
import options from './config/minecraft.json';
import { webhookID, webhookToken, guildID, channelID, logChannel, token } from './config/discord.json';
import 'colors';

const client = new Client({ autoReconnect: true });
const webhookClient = new WebhookClient(webhookID, webhookToken);

// Start Discord Bot
client.on('ready', () => {
    console.info('Discord: Logged in.'.bgBlue);
    client.guilds.get(guildID).channels.get(channelID).send('Logged In.');
});

let currentPlayers = 0;
let onlinePlayers = 0;
let onlineMembers = [];

// Start Minecraft Bot
const mc = createBot(options);

mc.on('login', () => {
    setTimeout(() => {
        console.info('Switching to guild chat. (If not already.)');
        mc.chat('/chat g');
    }, 1000);
    setTimeout(() => {
        mc.chat('Logged in');
    }, 2000);
    setTimeout(() => {
        mc.chat('/g online');
    }, 3000);
    setTimeout(() => {
        console.info('Sending to limbo.');
        mc.chat('/achat \u00a7c<3');
    }, 4000);
});

// Minecraft -> Discord
mc.on('message', (chatMsg) => {
    const msg = chatMsg.toString();
    const msgParts = msg.split(' ');
    console.info('Minecraft: '.brightGreen + msg);

    if (msg.includes('●')) {
        let listMsg = msg.split('●');

        for (k = 0; k < listMsg.length; k++) {
            onlineMembers = onlineMembers.concat(listMsg[k].replace(/\[.{1,}\]/g, '').replace(/\s/g, '')).filter(Boolean);
        };
    }

    if (msg.startsWith('Guild >')) {
        if (msgParts[2].includes(mc.username) || msgParts[3].includes(mc.username)) return;
        if (msgParts.length == 4 && !msg.includes(':')) {
            client.guilds.get(guildID).channels.get(channelID).send(msgParts[2] + ' ' + msgParts[3]);
            switch (msgParts[3]) {
                case 'joined.':
                    onlinePlayers++
                    break;
                case 'left.':
                    onlinePlayers--
                    break;
            }
        } else {
            let i = msg.indexOf(':');

            let sender;
            if (msgParts[2].includes('[')) sender = msgParts[3].replace(':', '');
            else sender = msgParts[2].replace(':', '');

            const sentMsg = [msg.slice(0, i), msg.slice(i + 1)];

            if (useWebhook == true) {
                webhookClient.send(sentMsg[1], {
                    disableEveryone: mentionEveryone,
                    username: sender,
                    avatarURL: 'https://www.mc-heads.net/avatar/' + sender,
                });
            } else {
                const embed = new RichEmbed()
                    .setAuthor(sender + ': ' + sentMsg[1], 'https://www.mc-heads.net/avatar/' + sender)
                    .setColor('GREEN');
                client.guilds.get(guildID).channels.get(channelID).send(embed);
            }
        }
    }

    if (msg.startsWith('Online Members')) onlinePlayers = msgParts[2];

    if (onlinePlayers !== currentPlayers) {
        client.user.setPresence({
            status: 'online',
            game: {
                name: onlinePlayers + ' guild members',
                type: 'WATCHING'
            }
        });
        currentPlayers = onlinePlayers;
    }

    // Join/Leave Messages
    if (msg.includes('the guild') && !msg.includes(':')) {
        let i;
        if (msg.startsWith('[')) {
            i = 1;
        } else {
            i = 0;
        }

        switch (msgParts[i + 1]) {
            case 'joined':
                client.guilds.get(guildID).channels.get(logChannel).send(msgParts[i] + ' joined the guild.');
                mc.chat('Welcome ' + msgParts[i] + '!');
                onlinePlayers++;
                break;
            case 'left':
                client.guilds.get(guildID).channels.get(logChannel).send(msgParts[i] + ' left the guild.');
                mc.chat('F');
                onlinePlayers--;
                break;
            case 'was':
                client.guilds.get(guildID).channels.get(logChannel).send(msgParts[i] + ' was kicked from the guild by ' + msgParts[msgParts.length - 1].replace('!', '.'));
                mc.chat('L');
                onlinePlayers--;
                break;
        }
    }
    //alfie is editing this
    if (msg.includes('!verify')) {
        if (msgParts[2].includes(mc.username) || msgParts[3].includes(mc.username)) return;
        const username = msgParts[4];
        const discTag = msgParts[5];
        const role = message.guild.roles.find(role => role.name === memberRole);
        const member = message.mentions.members.first();
        member.roles.add(role).catch(console.error);
        client.guilds.get(guildID).channels.get(logChannel).send(username + ' executed the command !verify ' + discTag);
        client.guilds.get(guildID).channels.get(logChannel).send(discTag + ' was given the role' + role);

    }

});

// Error Handling
mc.on('error', (error) => {
    console.warn('Connection lost.');
    console.warn(error);
    setTimeout(() => process.exit(1), 10000);
    if (error === undefined) return;
    client.guilds.get(guildID).channels.get(logChannel).send('Connection lost with error: ' + error);
});

mc.on('kicked', (reason) => {
    console.warn('Bot kicked.');
    console.warn(reason);
    setTimeout(() => process.exit(1), 10000);
    if (reason === undefined) return;
    client.guilds.get(guildID).channels.get(logChannel).send('Bot kicked with reason: ' + reason);
});

mc.once('end', error => {
    console.warn('Connection ended.');
    console.error(error);
    setTimeout(() => process.exit(1), 10000);
    if (error === undefined) return;
    client.guilds.get(guildID).channels.get(logChannel).send('Connection ended with error: ' + error);
});


// Discord -> Minecraft
client.on('message', message => {
    if (message.channel.id !== channelID || message.author.bot) return;
    let msgParts = message.content.split(' ');

    if (message.content.startsWith(prefix)) {
        switch (msgParts[0]) {
            case '-online':
                onlineMembers = []
                mc.chat('/g online')
                setTimeout(() => {
                    client.guilds.get(guildID).channels.get(channelID).send('The currently online guild members are: ' + onlineMembers)
                }, 2000);
                break;
            case '-logout':
                process.exit(0);
        }
    } else {
        console.info('Discord: '.blue + message.author.username + ': ' + message.content);
        mc.chat(client.guilds.get(guildID).member(message.author).displayName + ': ' + message.content);
    }
});

client.login(token);