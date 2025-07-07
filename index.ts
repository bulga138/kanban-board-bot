import 'dotenv/config';
import Discord, { ClientOptions } from 'discord.js';
import { KanbanBot } from './clients/discord-bot-wrapper';
import { KanbotConfiguration } from './application/kanbot-configuration';

if (!process.env.BOT_TOKEN || !process.env.BOT_NAME || !process.env.BOT_PREFIX) {
	console.error('Error: Missing required environment variables. Ensure BOT_TOKEN, BOT_NAME, and BOT_PREFIX are in your .env file.');
	process.exit(1);
}

const configuration: KanbotConfiguration = new KanbotConfiguration(
	process.env.BOT_TOKEN,
	process.env.BOT_NAME,
	process.env.BOT_PREFIX,
	'fart'
);
const clientOptions: ClientOptions = {
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.MessageContent, // Required to read message content in channels
	],
};
const discordClient: Discord.Client = new Discord.Client(clientOptions);
const bot: KanbanBot = new KanbanBot(configuration, discordClient);

bot.setupBot();
bot.login();