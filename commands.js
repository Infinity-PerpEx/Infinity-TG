// commands.mjs
import { Markup } from 'telegraf';
import { ethers } from 'ethers';
import axios from 'axios';
import * as middlewares from './middlewares.js';
import * as api from './api/scanner.js';
import bs58 from 'bs58';
import { BASE_URL, BROKER_ID } from './dist/config.js';
import { config } from 'dotenv';
import { addAccessKey, registerAccount } from './dist/register.js';
import { getClientHolding, getOpenAlgoOrders, getOpenOrders } from './dist/account.js';
import { cancelAlgoOrder, cancelOrder, createAlgoOrder, createOrder } from './dist/order.js';
import { signAndSendRequest } from './dist/signer.js';
import { getOrderbook } from './dist/orderbook.js';
import crypto from 'crypto-browserify';
import { OrderSide, OrderType } from '@orderly.network/types';



export async function startCommand(ctx) {
  let firstName = ctx.from.first_name || 'User'; // Define firstName variable here
  // Fetch Ethereum and Binance Smart Chain prices
  const ethPriceResponse = await api.getTokenDetails('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
  const bscPriceResponse = await api.getTokenDetails('0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599');
 // Extract prices from the response
 const ethPrice = ethPriceResponse.pairs.length > 0 ? ethPriceResponse.pairs[0].priceUsd.toFixed(2) : 'N/A';
 const bscPrice = bscPriceResponse.pairs.length > 0 ? bscPriceResponse.pairs[0].priceUsd.toFixed(2) : 'N/A';

 const Homekeyboard = Markup.inlineKeyboard([
  [Markup.button.callback(`🔑 Sign In`, 'sign-in')],
  [
    Markup.button.callback(`📈📉 Long/Short`, 'trade'),
    Markup.button.callback(`👜 Wallet`, 'wallet'),
  ],
  [
    Markup.button.callback(`📊 Active Trades`, 'active'),
    Markup.button.callback(`⚙️ Settings`, 'settings'),
  ],
  [Markup.button.url('📊 Chart', 'https://www.tradingview.com/symbols/ETHUSD/')],
  [Markup.button.url('🚨 Website', 'https://infinity-xi-seven.vercel.app/')]
]);


  try {
    
    // Get Telegram user ID
    const telegramId = ctx.from.id;

    // Make a request to check if the wallet exists for the Telegram ID
    const response = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);

    if (response.data.length > 0) {
      // If the wallet exists, display connected wallet details
      const walletData = response.data[0]; // Assuming you only need the first wallet if there are multiple
      const walletStatus = `Connected\nAddress: ${walletData.address}`;

      // Reply with connected wallet status
      ctx.replyWithMarkdown(
        `👋*Welcome* ${firstName} to Infinity \n\nThe *Fastest*⚡ and most *Reliable*🛡️ bot for your perpetual trading \n➡️ Leverage Trading \n➡️ Earn Fees \n\n🔗Connect your Wallet and Leverage trade  \n📈📉 *ETH/USD*  \n*📈📉 BTC/USD*   \n\nWallet 👜: *${walletStatus}*\nPrice $${ethPrice} (ETH/USDT) \nPrice $${bscPrice} (BTC/USDT) \n\n👁️ 0 Tracked Token(s) \n🙈 0 Position(s)`,
        Homekeyboard,
        Markup.keyboard(['/help']).resize()
      );
    } else {
      // If the wallet doesn't exist, display a message indicating that the wallet is not connected
      ctx.replyWithMarkdown(
        `👋*Welcome* ${firstName} to Infinity \n\nThe *Fastest*⚡ and most *Reliable*🛡️ bot for your perpetual trading \n➡️ Leverage Trading \n➡️ Earn Fees \n\n🔗Connect your Wallet and Leverage trade  \n📈📉 *ETH/USD*  \n*📈📉 BTC/USD*   \n\nWallet 👜: *Not Connected*\nPrice $${ethPrice} (ETH/USDT) \nPrice $${bscPrice} (BTC/USDT) \n\n👁️ 0 Tracked Token(s) \n🙈 0 Position(s)`,
        Homekeyboard,
        Markup.keyboard(['/help']).resize()
      );
    }
  } catch (error) {
    // If the wallet doesn't exist, display a message indicating that the wallet is not connected
    ctx.replyWithMarkdown(
      `👋*Welcome* ${firstName} to Infinity \n\nThe *Fastest*⚡ and most *Reliable*🛡️ bot for your perpetual trading \n➡️ Leverage Trading \n➡️ Earn Fees \n\n🔗Connect your Wallet and Leverage trade  \n📈📉 *ETH/USD*  \n*📈📉 BTC/USD*   \n\nWallet 👜: *Not Connected*\nPrice $${ethPrice} (ETH/USDT) \nPrice $${bscPrice} (BTC/USDT) \n\n👁️ 0 Tracked Token(s) \n🙈 0 Position(s)`,
      Homekeyboard,
      Markup.keyboard(['/help']).resize()
    );
  }
}



export function helpCommand(ctx) {
  ctx.reply('You asked for help!');
}



export async function signInCommand(ctx) {
  const deposit = Markup.inlineKeyboard([
    [
      Markup.button.callback(`💰Deposit`, 'deposit')
    ],
  ]);
  try {
      // Get Telegram user ID
      const telegramId = ctx.from.id;

      // Make a request to check if the wallet exists for the Telegram ID
      const response = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);

      if (response.data.length > 0) {
          // If the wallet exists, extract the private key from the API response
          const privateKey = response.data[0].private_key;
          console.log(privateKey)

          if (!privateKey) {
              // If private key doesn't exist, reply with "Create New Wallet" message
              ctx.reply('Create New Wallet');
              return;
          }

          // Use the private key to create a wallet instance
          const wallet = new ethers.Wallet(privateKey);
          const address = await wallet.getAddress();
          console.log(address)
          // Get account information
          const getAccountRes = await fetch(`${BASE_URL}/v1/get_account?address=${address}&broker_id=${BROKER_ID}`);
          const getAccountJson = await getAccountRes.json();

          let accountId;
          if (getAccountJson.success) {
              accountId = getAccountJson.data.account_id;
          } else {
              accountId = await registerAccount(wallet); // Assuming registerAccount function exists
          }

          let orderlyKey;
          try {
              // Decode orderly key if it exists
              orderlyKey = bs58.decode(orderlyKeyEncoded); // Pass the encoded key to decode
          } catch (err) {
              // If orderly key doesn't exist, add access key
              orderlyKey = await addAccessKey(wallet);
              const orderlyKeyEncoded = bs58.encode(orderlyKey);
              //ctx.reply(`Orderly Key: ${orderlyKeyEncoded}`);
              await getClientHolding(accountId, orderlyKey);
          }

          try {
              const res = await signAndSendRequest(accountId, orderlyKey, `${BASE_URL}/v1/client/holding`);
              const json = await res.json();
              console.log('getClientHolding:', JSON.stringify(json, undefined, 2));

              let holdingValue = 0;
              if (json && json.data && json.data.holding && json.data.holding.length > 0) {
                  holdingValue = json.data.holding[0].holding;
              } else {
                  console.error('No holding data found.');
              }

              // Format the reply message
              const replyMessage = `Account ID: ${accountId}\n\nBalance: ${holdingValue} USDC`;

              // Send the reply
              ctx.reply(replyMessage,deposit);
          } catch (error) {
              console.error('Error fetching client holding:', error);
              ctx.reply('Error fetching client holding. Please try again later.');
          }
      } else {
          ctx.reply('Wallet not found for the Telegram ID');
      }
  } catch (error) {
      console.error('Error signing in:', error);
      ctx.reply('Error signing in. Please try again later.');
  }
}



export async function deposit(ctx) {
  const deposit = Markup.inlineKeyboard([
    [
      Markup.button.url(`💰 Deposit Test Tokens`, 'https://orderly-sdk.vercel.app/')
    ],
  ]);
  try {
    // Get Telegram user ID
    const telegramId = ctx.from.id;

    // Make a request to check if the wallet exists for the Telegram ID
    const response = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);

    if (response.data.length > 0) {
      // If the wallet exists, extract the private key from the API response
      const privateKey = response.data[0].private_key;

      if (!privateKey) {
        // If private key doesn't exist, reply with "Import Wallet" message
        ctx.replyWithMarkdownctx.reply('Create New Wallet');
        return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();
      ctx.replyWithMarkdown(`Import your wallet private key into your Metamask and request for test faucet. \n\n*Navigate to the Asset Page* \n\nPrivate Key: ${privateKey}  `, deposit);
      // You can continue with your account information logic here if needed
    } else {
      // If the wallet doesn't exist, reply with "Create New Wallet" message
      ctx.reply('Create New Wallet');
    }
  } catch (error) {
    console.error('Error in deposit:', error);
    ctx.reply('Error processing the request. Please try again later.');
  }
}


export async function Trade(ctx) {
  const deposit = Markup.inlineKeyboard([
    [
      Markup.button.callback(`Long 📈`, 'long-trade'),
      Markup.button.callback(`Short 📉`, 'short-trade')
    ],
  ]);
  try {
    // Get Telegram user ID
    const telegramId = ctx.from.id;

    // Make a request to check if the wallet exists for the Telegram ID
    const response = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);

    if (response.data.length > 0) {
      // If the wallet exists, extract the private key from the API response
      const privateKey = response.data[0].private_key;

      if (!privateKey) {
        // If private key doesn't exist, reply with "Import Wallet" message
        ctx.replyWithMarkdownctx.reply('Create New Wallet');
        return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();
      ctx.replyWithMarkdown(`You can trade up to 100x with Infinty \n\n*ETH/USDT* Is the only pair tradeable now but more would be added soon `, deposit);
      // You can continue with your account information logic here if needed
    } else {
      // If the wallet doesn't exist, reply with "Create New Wallet" message
      ctx.reply('Create New Wallet');
    }
  } catch (error) {
    console.error('Error in deposit:', error);
    ctx.reply('Error processing the request. Please try again later.');
  }
}

export async function Long(ctx) {
  const deposit = Markup.inlineKeyboard([
    [
      Markup.button.callback(`Long 📈`, 'long'),
      Markup.button.callback(`Short 📉`, 'short')
    ],
  ]);
  try {
    // Get Telegram user ID
    const telegramId = ctx.from.id;

    // Make a request to check if the wallet exists for the Telegram ID
    const response = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);

    if (response.data.length > 0) {
      // If the wallet exists, extract the private key from the API response
      const privateKey = response.data[0].private_key;

      if (!privateKey) {
        // If private key doesn't exist, reply with "Import Wallet" message
        ctx.replyWithMarkdownctx.reply('Create New Wallet');
        return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();
      ctx.replyWithMarkdown(`You Can Open a long position📈 on ETH/USDT  \n\n*INSTANT EXECUTION*: use /long <levrage> <Ordersize-USDT> \n\n*LIMIT ORDER* use /longorder <Price> <levrage> <Ordersize-USDT> `);
      // You can continue with your account information logic here if needed
    } else {
      // If the wallet doesn't exist, reply with "Create New Wallet" message
      ctx.reply('Create New Wallet');
    }
  } catch (error) {
    console.error('Error in deposit:', error);
    ctx.reply('Error processing the request. Please try again later.');
  }
}

export async function Short(ctx) {
  
  try {
    // Get Telegram user ID
    const telegramId = ctx.from.id;

    // Make a request to check if the wallet exists for the Telegram ID
    const response = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);

    if (response.data.length > 0) {
      // If the wallet exists, extract the private key from the API response
      const privateKey = response.data[0].private_key;

      if (!privateKey) {
        // If private key doesn't exist, reply with "Import Wallet" message
        ctx.replyWithMarkdownctx.reply('Create New Wallet');
        return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();
      ctx.replyWithMarkdown(`You Can Open a *SHORT* position on ETH/USDT  \n\n*INSTANT EXECUTION*: use /short <levrage> <Ordersize-USDT> \n\n*LIMIT ORDER* use /shortorder <Price> <levrage> <Ordersize-USDT> `);
      // You can continue with your account information logic here if needed
    } else {
      // If the wallet doesn't exist, reply with "Create New Wallet" message
      ctx.reply('Create New Wallet');
    }
  } catch (error) {
    console.error('Error in deposit:', error);
    ctx.reply('Error processing the request. Please try again later.');
  }
}


export async function orderCommand(ctx) {
  try {
      // Predefined values
      const symbol = 'PERP_ETH_USDC';
      const orderType = 'LIMIT';
      const side = 'BUY';
      const telegramId = ctx.from.id;

      // Make a request to check if the wallet exists for the Telegram ID
      const walletResponse = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);
      if (walletResponse.data.length === 0) {
          ctx.reply('No wallet associated with this account. Please create one.');
          return;
      }

      const privateKey = walletResponse.data[0].private_key;
      if (!privateKey) {
          ctx.reply('No private key found. Please create a new wallet.');
          return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();

      // Get account information
      const getAccountRes = await fetch(`${BASE_URL}/v1/get_account?address=${address}&broker_id=${BROKER_ID}`);
      const getAccountJson = await getAccountRes.json();

      let accountId;
      if (getAccountJson.success) {
          accountId = getAccountJson.data.account_id;
      } else {
          accountId = await registerAccount(wallet);
      }

      
      let orderlyKey;
      try {
          // Decode orderly key if it exists
          orderlyKey = bs58.decode(orderlyKeyEncoded); // Pass the encoded key to decode
      } catch (err) {
          // If orderly key doesn't exist, add access key
          orderlyKey = await addAccessKey(wallet);
          const orderlyKeyEncoded = bs58.encode(orderlyKey);
          //ctx.reply(`Orderly Key: ${orderlyKeyEncoded}`);
          await getClientHolding(accountId, orderlyKey);
      }
      const { data: { bids } } = await getOrderbook(symbol, 1, accountId, orderlyKey);
      // Parse command parameters for price and quantity
      const [command, orderPrice, orderQuantity] = ctx.message.text.split(' ');
      if (!orderPrice || !orderQuantity) {
          ctx.reply("Usage: /long orderPrice orderQuantity");
          return;
      }
     const result = orderQuantity / bids[0].price;
     const roundedResult = parseFloat(result.toFixed(2));
      // Call the createOrder function
      const orderResponse = await createOrder(symbol, orderType, side, Math.round(bids[0].price * 0.99999), roundedResult, accountId, orderlyKey);
      const markdownResponse = `
      *BUY Order created successfully📈📈\\!*

      *Order ID:* \`${orderResponse.data.order_id}\`
      *Order Type:* \`${orderResponse.data.order_type}\`
      *Order Price:* \`${orderResponse.data.order_price}\`
      *Order Quantity:* \`${orderResponse.data.order_quantity}\`

      *Timestamp:* \`${new Date(orderResponse.timestamp).toLocaleString().replace(/[-.]/g, '\\$&')}\`
      `;

      ctx.reply(markdownResponse, { parse_mode: 'MarkdownV2' });


  } catch (error) {
      console.error('Error creating order:', error);
      ctx.reply('Orded not in range, Try again');
  }
}



export async function shortCommand(ctx) {
  try {
      // Predefined values
      const symbol = 'PERP_ETH_USDC';
      const orderType = 'LIMIT';
      const side = 'SELL';
      const telegramId = ctx.from.id;

      // Make a request to check if the wallet exists for the Telegram ID
      const walletResponse = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);
      if (walletResponse.data.length === 0) {
          ctx.reply('No wallet associated with this account. Please create one.');
          return;
      }

      const privateKey = walletResponse.data[0].private_key;
      if (!privateKey) {
          ctx.reply('No private key found. Please create a new wallet.');
          return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();

      // Get account information
      const getAccountRes = await fetch(`${BASE_URL}/v1/get_account?address=${address}&broker_id=${BROKER_ID}`);
      const getAccountJson = await getAccountRes.json();

      let accountId;
      if (getAccountJson.success) {
          accountId = getAccountJson.data.account_id;
      } else {
          accountId = await registerAccount(wallet);
      }

      
      let orderlyKey;
      try {
          // Decode orderly key if it exists
          orderlyKey = bs58.decode(orderlyKeyEncoded); // Pass the encoded key to decode
      } catch (err) {
          // If orderly key doesn't exist, add access key
          orderlyKey = await addAccessKey(wallet);
          const orderlyKeyEncoded = bs58.encode(orderlyKey);
          //ctx.reply(`Orderly Key: ${orderlyKeyEncoded}`);
          await getClientHolding(accountId, orderlyKey);
      }
      const { data: { bids } } = await getOrderbook(symbol, 1, accountId, orderlyKey);
      // Parse command parameters for price and quantity
      const [command, orderPrice, orderQuantity] = ctx.message.text.split(' ');
      if (!orderPrice || !orderQuantity) {
          ctx.reply("Usage: /short orderPrice orderQuantity");
          return;
      }
     const result = orderQuantity / bids[0].price;
     const roundedResult = parseFloat(result.toFixed(2));
      // Call the createOrder function
      const orderResponse = await createOrder(symbol, orderType, side, Math.round(bids[0].price * 0.99999), roundedResult, accountId, orderlyKey);
      const markdownResponse = `
      *SELL📉 Order created successfully\\!*

      *Order ID:* \`${orderResponse.data.order_id}\`
      *Order Type:* \`${orderResponse.data.order_type}\`
      *Order Price:* \`${orderResponse.data.order_price}\`
      *Order Quantity:* \`${orderResponse.data.order_quantity}\`

      *Timestamp:* \`${new Date(orderResponse.timestamp).toLocaleString().replace(/[-.]/g, '\\$&')}\`
      `;

      ctx.reply(markdownResponse, { parse_mode: 'MarkdownV2' });


  } catch (error) {
      console.error('Error creating order:', error);
      ctx.reply('Orded not in range, Try again within range');
  }
}




export async function longorderCommand(ctx) {
  try {
      // Predefined values
      const symbol = 'PERP_ETH_USDC';
      const orderType = 'LIMIT';
      const side = 'BUY';
      const telegramId = ctx.from.id;

      // Make a request to check if the wallet exists for the Telegram ID
      const walletResponse = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);
      if (walletResponse.data.length === 0) {
          ctx.reply('No wallet associated with this account. Please create one.');
          return;
      }

      const privateKey = walletResponse.data[0].private_key;
      if (!privateKey) {
          ctx.reply('No private key found. Please create a new wallet.');
          return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();

      // Get account information
      const getAccountRes = await fetch(`${BASE_URL}/v1/get_account?address=${address}&broker_id=${BROKER_ID}`);
      const getAccountJson = await getAccountRes.json();

      let accountId;
      if (getAccountJson.success) {
          accountId = getAccountJson.data.account_id;
      } else {
          accountId = await registerAccount(wallet);
      }

      
      let orderlyKey;
      try {
          // Decode orderly key if it exists
          orderlyKey = bs58.decode(orderlyKeyEncoded); // Pass the encoded key to decode
      } catch (err) {
          // If orderly key doesn't exist, add access key
          orderlyKey = await addAccessKey(wallet);
          const orderlyKeyEncoded = bs58.encode(orderlyKey);
          //ctx.reply(`Orderly Key: ${orderlyKeyEncoded}`);
          await getClientHolding(accountId, orderlyKey);
      }
      const { data: { bids } } = await getOrderbook(symbol, 1, accountId, orderlyKey);
      // Parse command parameters for price and quantity
      const [command,LimitPrice, orderPrice, orderQuantity] = ctx.message.text.split(' ');
      if (!orderPrice || !orderQuantity) {
          ctx.reply("Usage: /longorder LIMIT-PRICE orderPrice orderQuantity");
          return;
      }
     const result = orderQuantity / bids[0].price;
     const roundedResult = parseFloat(result.toFixed(2));
      // Call the createOrder function
      const orderResponse = await createOrder(symbol, orderType, side, LimitPrice, roundedResult, accountId, orderlyKey);
      const markdownResponse = `
      *BUY Order created successfully📈📈\\!*

      *Order ID:* \`${orderResponse.data.order_id}\`
      *Order Type:* \`${orderResponse.data.order_type}\`
      *Order Price:* \`${orderResponse.data.order_price}\`
      *Order Quantity:* \`${orderResponse.data.order_quantity}\`

      *Timestamp:* \`${new Date(orderResponse.timestamp).toLocaleString().replace(/[-.]/g, '\\$&')}\`
      `;

      ctx.reply(markdownResponse, { parse_mode: 'MarkdownV2' });


  } catch (error) {
      console.error('Error creating order:', error);
      ctx.reply('Orded not in range, Try again');
  }
}


export async function shortorderCommand(ctx) {
  try {
      // Predefined values
      const symbol = 'PERP_ETH_USDC';
      const orderType = 'LIMIT';
      const side = 'SELL';
      const telegramId = ctx.from.id;

      // Make a request to check if the wallet exists for the Telegram ID
      const walletResponse = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);
      if (walletResponse.data.length === 0) {
          ctx.reply('No wallet associated with this account. Please create one.');
          return;
      }

      const privateKey = walletResponse.data[0].private_key;
      if (!privateKey) {
          ctx.reply('No private key found. Please create a new wallet.');
          return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();

      // Get account information
      const getAccountRes = await fetch(`${BASE_URL}/v1/get_account?address=${address}&broker_id=${BROKER_ID}`);
      const getAccountJson = await getAccountRes.json();

      let accountId;
      if (getAccountJson.success) {
          accountId = getAccountJson.data.account_id;
      } else {
          accountId = await registerAccount(wallet);
      }

      
      let orderlyKey;
      try {
          // Decode orderly key if it exists
          orderlyKey = bs58.decode(orderlyKeyEncoded); // Pass the encoded key to decode
      } catch (err) {
          // If orderly key doesn't exist, add access key
          orderlyKey = await addAccessKey(wallet);
          const orderlyKeyEncoded = bs58.encode(orderlyKey);
          //ctx.reply(`Orderly Key: ${orderlyKeyEncoded}`);
          await getClientHolding(accountId, orderlyKey);
      }
      const { data: { bids } } = await getOrderbook(symbol, 1, accountId, orderlyKey);
      // Parse command parameters for price and quantity
      const [command,LimitPrice, orderPrice, orderQuantity] = ctx.message.text.split(' ');
      if (!orderPrice || !orderQuantity) {
          ctx.reply("Usage: /shortorder LIMIT-PRICE orderPrice orderQuantity");
          return;
      }
     const result = orderQuantity / bids[0].price;
     const roundedResult = parseFloat(result.toFixed(2));
      // Call the createOrder function
      const orderResponse = await createOrder(symbol, orderType, side, LimitPrice, roundedResult, accountId, orderlyKey);
      const markdownResponse = `
      *SELL📉 Order created successfully\\!*

      *Order ID:* \`${orderResponse.data.order_id}\`
      *Order Type:* \`${orderResponse.data.order_type}\`
      *Order Price:* \`${orderResponse.data.order_price}\`
      *Order Quantity:* \`${orderResponse.data.order_quantity}\`

      *Timestamp:* \`${new Date(orderResponse.timestamp).toLocaleString().replace(/[-.]/g, '\\$&')}\`
      `;

      ctx.reply(markdownResponse, { parse_mode: 'MarkdownV2' });


  } catch (error) {
      console.error('Error creating order:', error);
      ctx.reply('Orded not in range, Try again');
  }
}


export async function walletCallback(ctx) {
  const firstName = ctx.from.first_name || 'User';
  const Walletkeyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(`👜 Create Wallet`, 'new-wallet'),
      Markup.button.callback(`🏠Home`, 'start'),
    ],
 
  ]);
  const walletManagementKeyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(` Balance`, 'balance'),
      Markup.button.callback(` Deposit`, 'deposit'),
    ],
  ]);
  try {
    const telegramId = ctx.from.id; // Get the Telegram ID of the user
    console.log('telegramId', telegramId );

    // Make a request to the API to check if the wallet exists for the Telegram ID
    const response = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);

    if (response.data.error && response.data.error === 'Wallets not found for this telegram_id') {
      // If the API indicates that no wallets were found, create a new wallet
      ctx.reply('You don\'t have a wallet yet. Creating a new wallet...');
      // Implement logic to create a new wallet
    } else if (response.data.length > 0) {
      // If the wallet exists, display the wallet section
      const walletData = response.data[0]; // Assuming you only need the first wallet if there are multiple
      ctx.reply(`Your wallet address: ${walletData.address}`,walletManagementKeyboard);
      // Add more information about the wallet if needed
    } else {
      // Handle unexpected response
      ctx.reply('An unexpected response was received from the server.');
    }
  } catch (error) {
    console.error('Error in walletCallback:', error);
    // Handle error
    ctx.replyWithMarkdown(`👋*Hello* ${firstName} you don't have any wallet connected to this account \n\n *Kindly follow* ⏬ `, Walletkeyboard);
  }
}


export async function walletCommand(ctx) {
  try {
    // Create a new random wallet
    const wallet = ethers.Wallet.createRandom();

    // Extract wallet details
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonicPhrase = wallet.mnemonic.phrase;

    // Prepare the reply message with wallet details
    const walletInfoMessage = `
      👜👜👜👜👜👜👜👜👜👜
      
      NEW WALLET CREATED
      
      This is your new wallet:
      
      Address: 
      ${address}
    
      Private Key:
      ${privateKey}
    
      Mnemonic Phrase: 
      ${mnemonicPhrase}
    
      🚀 Keep your private key and mnemonic phrase safe!
    
      💼 You can also add it to any Ethereum wallet.
    
      Enjoy secure crypto transactions!
    
      👜👜👜👜👜👜👜👜👜👜
    `;
    
    const walletManagementKeyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback(` Balance`, 'balance'),
        Markup.button.callback(` Deposit`, 'deposit'),
      ],
    ]);

    // Send the wallet details to the API
    const telegramId = ctx.from.id; // Get the Telegram ID of the user
    await axios.post(`https://infinity-database.onrender.com/api/infinity`, {
      telegram_id: telegramId,
      address: address,
      private_key: privateKey,
      seed_phrase: mnemonicPhrase
    });

    // Send the reply message with wallet details and keyboard
    ctx.reply(walletInfoMessage, walletManagementKeyboard);

    console.log('Response sent:', 'Create new wallet button clicked');
  } catch (error) {
    console.error('Error in walletCommand:', error);
    // Handle error
    ctx.reply('An error occurred while processing your request.');
  }
}

export function scannerCommand(ctx) {
  ctx.reply('Please input your ETH/BSC Contract Address');
}

export async function getAddressDetailsCommand(ctx) {
  try {
    const address = extractAddressFromMessage(ctx.message.text);

    if (address) {
      const details = await api.getAddressDetails(address);
      const prices = await api.getTokenDetails(address);
      console.log(details);
      const flagsMessage = details.flags.length ? `\n\n⚠️${details.flags}` : '';
      const honeypotStatus = details.honeypotResult.isHoneypot ? '\n\n⚠️HONEY POT' : '\n\nNO HONEY POT';
      const gasMessage = details.holderAnalysis.averageGas ? `⛽ Gas: ${details.holderAnalysis.averageGas.toFixed(2)}` : '';
      const createdAtTimestamp = details.pair.createdAtTimestamp;

      const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
      const secondsDifference = currentTimestamp - createdAtTimestamp;
      const daysDifference = Math.floor(secondsDifference / (60 * 60 * 24));

      ctx.reply(` 📌 ${details.token.name}(${details.token.symbol})${flagsMessage}${honeypotStatus}\n\n ⚠️️ Max Transaction | Set Tax | Max Wallet \n\n🔸 Chain: ${details.chain.currency}|| ⚖️ Age: ${daysDifference} Days \n\n👩‍👧‍👦 Total Holders: ${details.token.totalHolders} \n\n💳buyTax:${details.simulationResult.buyTax}||sellTax:${details.simulationResult.sellTax} \n\n ${gasMessage} \n\n💲 Price: $${prices.pairs[0].priceUsd.toFixed(6)} \n\n💰 MarketCap:${prices.pairs[0].fdv.toFixed(6)}\n\nDYOR/NFA: Automated report.\n\nWishing everyone a HAPPY NEW YEAR 🥂from the Future Edge FAM `);
    } else {
      ctx.reply('Not a valid address found in the message.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    ctx.reply('Error processing the request. Please try again later.');
  }
}

// Function to extract Ethereum address from a message
export function extractAddressFromMessage(message) {
  const addressRegex = /(0x[a-fA-F0-9]{40})/;
  const match = message.match(addressRegex);
  return match ? match[0] : null;
}


export async function activeTrades(ctx) {
  try {
      // Predefined values
      const symbol = 'PERP_ETH_USDC';
      const orderType = 'LIMIT';
      const side = 'SELL';
      const telegramId = ctx.from.id;

      // Make a request to check if the wallet exists for the Telegram ID
      const walletResponse = await axios.get(`https://infinity-database.onrender.com/api/infinity/wallets/${telegramId}`);
      if (walletResponse.data.length === 0) {
          ctx.reply('No wallet associated with this account. Please create one.');
          return;
      }

      const privateKey = walletResponse.data[0].private_key;
      if (!privateKey) {
          ctx.reply('No private key found. Please create a new wallet.');
          return;
      }

      // Use the private key to create a wallet instance
      const wallet = new ethers.Wallet(privateKey);
      const address = await wallet.getAddress();

      // Get account information
      const getAccountRes = await fetch(`${BASE_URL}/v1/get_account?address=${address}&broker_id=${BROKER_ID}`);
      const getAccountJson = await getAccountRes.json();

      let accountId;
      if (getAccountJson.success) {
          accountId = getAccountJson.data.account_id;
      } else {
          accountId = await registerAccount(wallet);
      }

      
      let orderlyKey;
      try {
          // Decode orderly key if it exists
          orderlyKey = bs58.decode(orderlyKeyEncoded); // Pass the encoded key to decode
      } catch (err) {
          // If orderly key doesn't exist, add access key
          orderlyKey = await addAccessKey(wallet);
          const orderlyKeyEncoded = bs58.encode(orderlyKey);
          //ctx.reply(`Orderly Key: ${orderlyKeyEncoded}`);
          await getClientHolding(accountId, orderlyKey);
      }
      const orders = await getOpenOrders(accountId, orderlyKey);


      if (orders.length === 0) {
        ctx.reply("No active orders found.");
    } else {
        let message = "*Active Orders:*\n";
        orders.forEach((order, index) => {
            message += `*${index + 1}.* Order ID: \`${order.order_id}\`, Status: \`${order.status}\`, Type: \`${order.type}\`, Price: \`${order.price}\`, Quantity: \`${order.quantity}\`\n\n`;
        });
        // Append the instruction to the same message
        message += "To close a trade use `/close <orderId>`";
    
        // Send the combined message with Markdown formatting
        ctx.reply(message, { parse_mode: 'Markdown' });
    }
    

  } catch (error) {
      console.error('Error creating order:', error);
      ctx.reply('Orded not in range, Try again within range');
  }
}