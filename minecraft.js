import Discord from 'discord.js';
import mineflayer from 'mineflayer';
import bridge from './index.js';
import conf from './config/config.json';
const config = conf.discord;

const mc = mineflayer.createBot(conf.minecraft);
const webhook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

mc.on('login', () => {
    setTimeout(() => {
        console.info('Switching to guild chat. (If not already.)');
        mc.chat('/chat g');
    }, 1000);
    setTimeout(() => mc.chat('Logged in'), 2000);
    setTimeout(() => mc.chat('/g online'), 3000);
    setTimeout(() => {
        console.info('Sending to limbo.');
        mc.chat('/achat \u00a7c<3');
    }, 4000);
});

mc.on('message', chatMsg => {
    const msg = chatMsg.toString();
    const msgParts = msg.split(' ');
    console.info('Minecraft: '.brightGreen + msg);

    if (msg.includes('●')) {
        let listMsg = msg.split('●');
        for (k = 0; k < listMsg.length; k++) bridge.onlineMembers = bridge.onlineMembers.concat(listMsg[k].replace(/\[.{1,}\]/g, '').replace(/\s/g, '')).filter(Boolean);
    }

    if (msg.startsWith('Guild >')) {
        if (msgParts[2].includes(mc.username) || msgParts[3].includes(mc.username)) return;

        if (msgParts.length == 4 && !msg.includes(':')) {
            bridge.channel.send(msgParts[2] + ' ' + msgParts[3]);
            switch (msgParts[3]) {
                case 'joined.': bridge.onlinePlayers++; break;
                case 'left.':   bridge.onlinePlayers--; break;
            }
        } else {
            let i = msg.indexOf(':');

            let sender;
            if (msgParts[2].includes('[')) sender = msgParts[3].replace(':', '');
            else sender = msgParts[2].replace(':', '');

            const sentMsg = [msg.slice(0, i), msg.slice(i + 1)];

            if (useWebhook == true) {
                webhook.send(sentMsg[1], {
                    disableEveryone: mentionEveryone,
                    username: sender,
                    avatarURL: 'https://www.mc-heads.net/avatar/' + sender,
                });
            } else {
                const embed = new Discord.MessageEmbed()
                    .setAuthor(sender + ': ' + sentMsg[1], 'https://www.mc-heads.net/avatar/' + sender)
                    .setColor('GREEN');
                bridge.channel.send(embed);
            }
        }
    }

    if (msg.startsWith('Online Members')) bridge.onlinePlayers = msgParts[2];

    if (bridge.onlinePlayers !== bridge.currentPlayers) {
        client.user.setPresence({
            status: 'online',
            game: {
                name: bridge.onlinePlayers + ' guild members',
                type: 'WATCHING'
            }
        });
        bridge.currentPlayers = bridge.onlinePlayers;
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
                bridge.logs.send(msgParts[i] + ' joined the guild.');
                mc.chat('Welcome ' + msgParts[i] + '!');
                bridge.onlinePlayers++;
                break;
            case 'left':
                bridge.logs.send(msgParts[i] + ' left the guild.');
                mc.chat('F');
                bridge.onlinePlayers--;
                break;
            case 'was':
                bridge.logs.send(msgParts[i] + ' was kicked from the guild by ' + msgParts[msgParts.length - 1].replace('!', '.'));
                mc.chat('L');
                bridge.onlinePlayers--;
                break;
        }
    }
    //alfie is editing this
    //is this supposed to be a minecraft or a discord command? It is trying to be both and either way it doesn't work
    if (msg.includes('!verify')) {
    /*    if (msgParts[2].includes(mc.username) || msgParts[3].includes(mc.username)) return;
        const username = msgParts[4];
        const discordTag = msgParts[5];
        const role = bridge.guild.roles.cache.get(config.memberRoleID);
        const member = message.mentions.members.first();
        member.roles.add(role).catch(console.error);
        bridge.logs.send(username + ' executed the command !verify ' + discordTag);
        bridge.logs.send(discordTag + ' was given the role' + role);
    */}
});

mc.on('error', (error) => {
    console.warn('Connection lost.');
    console.warn(error);
    setTimeout(() => process.exit(1), 10000);
    if (error === undefined) return;
    bridge.logs.send('Connection lost with error: ' + error);
});

mc.on('kicked', (reason) => {
    console.warn('Bot kicked.');
    console.warn(reason);
    setTimeout(() => process.exit(1), 10000);
    if (reason === undefined) return;
    bridge.logs.send('Bot kicked with reason: ' + reason);
});

mc.once('end', error => {
    console.warn('Connection ended.');
    console.error(error);
    setTimeout(() => process.exit(1), 10000);
    if (error === undefined) return;
    bridge.logs.send('Connection ended with error: ' + error);
});