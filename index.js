import {Client, Intents, WebhookClient, MessageEmbed} from "discord.js";
import config from './config/config.json';
import mineflayer from "mineflayer";
const bot = config.discord;
import 'colors';

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_INTEGRATIONS);
const webhook = new WebhookClient({id: bot.webhook.id, token: bot.webhook.token});
const client = new Client({autoReconnect: true, intents: myIntents});
var currentPlayers = 0;
var onlineMembers = [];
var onlinePlayers = 0;
var channel;
var guild;
var logs;

// Start Discord Bot
client.on("ready", async () => {
    console.log("Discord: Logged in.".bgBlue);
    guild = await client.guilds.fetch(bot.guildID);
    channel = guild.channels.cache.get(bot.channelID);
    logs = guild.channels.cache.get(bot.logChannel);
    channel.send("Logged In.");
});

// Start Minecraft Bot
let mc = mineflayer.createBot(config.minecraft);

mc.on("login", () => {
    setTimeout(() => {
        console.log("Switching to guild chat. (If not already.)");
        mc.chat("/chat g");
    }, 1000);
    setTimeout(() => mc.chat("Logged in"), 2000);
    setTimeout(() => mc.chat("/g online"), 3000);
    setTimeout(() => {
        console.log("Sending to limbo.");
        mc.chat("/achat \u00a7c<3");
    }, 4000);
});

// Minecraft > Discord
mc.on("message", (chatMsg) => {
    const msg = chatMsg.toString();
    let msgParts = msg.split(" ");
    console.log("Minecraft: ".brightGreen + msg);

    if (msg.includes("●")) {
        var k;
        let listMsg = msg.split("●");
        for (k = 0; k < listMsg.length; k++) onlineMembers = onlineMembers.concat(listMsg[k].replace(/\[.{1,}\]/g, "").replace(/\s/g, "")).filter(Boolean);
    }

    if (msg.startsWith("Guild >")) {
        if (msgParts[2].includes(mc.username) || msgParts[3].includes(mc.username)) return;
        if (msgParts.length == 4 && !msg.includes(":")) {
            channel.send(msgParts[2] + " " + msgParts[3]);
            switch (msgParts[3]) {
                case "joined.":
                    onlinePlayers++
                    break;
                case "left.":
                    onlinePlayers--
                    break;
            }
        } else {
            let i = msg.indexOf(":");
            let sentMsg = [msg.slice(0, i), msg.slice(i + 1)];
            let sender;
            if (msgParts[2].includes("[")) {
                sender = msgParts[3].replace(":", "");
            } else {
                sender = msgParts[2].replace(":", "");
            }

            if (bot.webhook.enabled == true) webhook.send({content: `${sentMsg[1]}`, username: `${sender}`, avatarURL: `https://www.mc-heads.net/avatar/${sender}`, allowedMentions: {parse: ["users"]}});
            else {
                let embed = new MessageEmbed({color: 'NAVY', author: {name: `${sender}: ${sentMsg[1]}`, iconURL: `https://www.mc-heads.net/avatar/${sender}`}});
                channel.send({embeds: [embed]});
            }
        }
    }

    if (msg.startsWith("Online Members")) onlinePlayers = msgParts[2];

    if (onlinePlayers !== currentPlayers) {
        client.user.setPresence({activities: [{name: `${onlinePlayers} guild members`, type: 'WATCHING'}], status: 'dnd' });
        currentPlayers = onlinePlayers
        }

    // Join/Leave Messages
    if (msg.includes("the guild") && !msg.includes(":")) {
        var i;
        if (msg.startsWith("[")) i = 1; else i = 0;

        switch (msgParts[i + 1]) {
            case "joined":
                logs.send(msgParts[i] + " joined the guild.");
                mc.chat("Welcome " + msgParts[i] + "!");
                onlinePlayers++
                break;
            case "left":
                logs.send(msgParts[i] + " left the guild.");
                mc.chat("F");
                onlinePlayers--
                break;
            case "was":
                logs.send(msgParts[i] + " was kicked from the guild by " + msgParts[msgParts.length - 1].replace('!', '.'));
                mc.chat("L");
                onlinePlayers--
                break;
        }
    }

    // Guild Quest completion.
    if (msg.includes("guild" && "Tier" && "Quest") && !msg.includes(":")) {
        channel.send("The Guild has just completed Tier " + msgParts[9] + " of this week's guild quest! GG!");
        mc.chat("GG!");
    }

    // Guild Level up.
    if (msg.includes("Guild" && "Level") && !msg.includes(":")) {
        channel.send("The Guild has just reached level " + msgParts[msgParts.length - 1].replace('!', '') + " GG!");
        mc.chat("GG!");
    }
});

// Error Handling
mc.on("error", (error) => {
    console.warn("Connection lost.");
    console.warn(error);
    setTimeout(() => process.exit(1), 10000);
    if (error === undefined) return;
    logs.send("Connection lost with error: " + error);
});

mc.on("kicked", (reason) => {
    console.warn("Bot kicked.");
    console.warn(reason);
    setTimeout(() => process.exit(1), 10000);
    if (reason === undefined) return;
    logs.send("Bot kicked with reason: " + reason);
});

mc.once("end", (error) => {
    console.warn("Connection ended.");
    console.warn(error);
    setTimeout(() => process.exit(1), 10000);
    if (error === undefined) return;
    logs.send("Connection ended with error: " + error);
});

// Discord > Minecraft
client.on("messageCreate", (message) => {
    if (message.channel.id !== bot.channelID || message.author.bot) return;
    console.log("Discord: ".blue + message.member.displayName + " (User: " + message.author.username + "): " + message.content);
    let msgParts = message.content.split(' ');

    if (message.content.startsWith(bot.prefix)) {
        switch (msgParts[0]) {
            case `${bot.prefix}online`:
                onlineMembers = []
                mc.chat("/g online")
                setTimeout(() => channel.send("The currently online guild members are: " + onlineMembers), 2000);
                break;
        }
    } else mc.chat(message.member.displayName + ": " + message.content);
});

client.login(bot.token);