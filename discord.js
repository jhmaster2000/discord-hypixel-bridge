import Discord from 'discord.js';
import conf from './config/config.json';
const config = conf.discord;
import bridge from './index.js';

const client = new Discord.Client({ autoReconnect: true });

client.on('ready', () => {
    console.info('Discord: Logged in.'.bgBlue);

    bridge.guild   = client.guilds.cache.get(config.guildID);
    bridge.channel = bridge.guild.channels.cache.get(config.channelID);
    bridge.logs    = bridge.guild.channels.cache.get(config.logChannel);

    bridge.channel.send('Logged In.');
});

client.on('message', message => {
    if (message.channel.id !== config.channelID || message.author.bot) return;
    let msgParts = message.content.split(' ');

    if (message.content.startsWith(config.prefix)) {
        switch (msgParts[0]) {
            case '-online':
                bridge.onlineMembers = [];
                mc.chat('/g online');
                setTimeout(() => bridge.channel.send('The currently online guild members are: ' + bridge.onlineMembers), 2000);
                break;
            case '-logout': process.exit(0);
        }
    } else {
        console.info('Discord: '.blue + message.author.username + ': ' + message.content);
        mc.chat(message.member.displayName + ': ' + message.content);
    }
});

client.login(config.token);