import 'colors';
import { Guild, TextChannel } from 'discord.js';

const bridge = {};

bridge.currentPlayers = 0;
bridge.onlinePlayers  = 0;
bridge.onlineMembers  = [];

bridge.guild   = new Guild;
bridge.channel = new TextChannel;
bridge.logs    = new TextChannel;

export default bridge;

import('./discord.js');
import('./minecraft.js');