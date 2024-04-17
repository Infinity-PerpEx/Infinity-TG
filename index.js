// index.js
import { Telegraf } from 'telegraf';
import config from './config.js';
import * as commands from './commands.js';
import * as middlewares from './middlewares.js';

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// Middlewares
bot.use(middlewares.logMiddleware);

// Commands
bot.command('start', commands.startCommand);

bot.action('wallet', commands.walletCommand);

bot.help(commands.helpCommand);


// Start the bot
bot.launch().then(() => console.log('Bot is running'));
