// index.js
import { Telegraf } from 'telegraf';
import config from './config.js';
import * as commands from './commands.js';
import * as middlewares from './middlewares.js';
import './polyfill.js';

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// Middlewares
bot.use(middlewares.logMiddleware);

// Commands
bot.command('start', commands.startCommand);

bot.action('wallet', commands.walletCallback);

bot.action('sign-in', commands.signInCommand);

bot.action('balance', commands.signInCommand);

bot.action('new-wallet', commands.walletCommand);

bot.action('deposit', commands.deposit);

bot.action('active', commands.activeTrades);

bot.action('trade', commands.Trade);

bot.action('long-trade', commands.Long);

bot.action('short-trade', commands.Short);

bot.command('longorder', commands.longorderCommand);

bot.command('long', commands.orderCommand);

bot.command('shortorder', commands.shortorderCommand);

bot.command('short', commands.shortCommand);

bot.help(commands.helpCommand);


// Start the bot
bot.launch().then(() => console.log('Bot is running'));
