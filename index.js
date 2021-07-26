import 'colors';
import { Guild, TextChannel } from 'discord.js';

const bridge = {};

bridge.currentPlayers = 0;
bridge.onlinePlayers  = 0;
bridge.onlineMembers  = [];

bridge.guild   = null; //new Guild;
bridge.channel = null; //new TextChannel;
bridge.logs    = null; //new TextChannel;

export default bridge;

import('./discord.js');
import('./minecraft.js');