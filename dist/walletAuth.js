import { getPublicKeyAsync, utils } from '@noble/ed25519';
import { config } from 'dotenv';
import { encodeBase58, ethers } from 'ethers';
import { webcrypto } from 'node:crypto';
import { supabase } from '../supabaseClient';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!globalThis.crypto)
    globalThis.crypto = webcrypto;
const MESSAGE_TYPES = {
    EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
    ],
    AddOrderlyKey: [
        { name: 'brokerId', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'orderlyKey', type: 'string' },
        { name: 'scope', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'expiration', type: 'uint64' }
    ]
};
const OFF_CHAIN_DOMAIN = {
    name: 'Orderly',
    version: '1',
    chainId: 421614,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};
const BASE_URL = 'https://testnet-api-evm.orderly.org';
const BROKER_ID = 'woofi_dex';
const CHAIN_ID = 421614;
config();



async function createOrderlyKey() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const walletAddress = wallet.getAddress();
    const privateKey = utils.randomPrivateKey();
    const mnemonicPhrase = wallet.mnemonic.phrase;
    const orderlyKey = `ed25519:${encodeBase58(await getPublicKeyAsync(privateKey))}`;
    const timestamp = Date.now();
    const addKeyMessage = {
        brokerId: BROKER_ID,
        chainId: CHAIN_ID,
        orderlyKey,
        scope: 'read,trading',
        timestamp,
        expiration: timestamp + 1000 * 60 * 60 * 24 * 365 // 1 year
    };
    const signature = await wallet.signTypedData(OFF_CHAIN_DOMAIN, {
        AddOrderlyKey: MESSAGE_TYPES.AddOrderlyKey
    }, addKeyMessage);
    const keyRes = await fetch(`${BASE_URL}/v1/orderly_key`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: addKeyMessage,
            signature,
            userAddress: await wallet.getAddress()
        })
    });
    const keyJson = await keyRes.json();
    console.log('addAccessKey', keyJson);
    await storeData(walletAddress, privateKey, orderlyKey);
}
async function storeData(walletAddress, privateKey, orderlyKey, mnemonicPhrase) {
    try {
        const { data, error } = await supabase
            .from("Users")
            .upsert([
                { wallet_address: walletAddress, private_key: privateKey, orderly_key: orderlyKey, mnemonic_phrase: mnemonicPhrase }
            ])
            .select();

        if (error) {
            console.error("Error storing", error.message);
        } else {
            console.log("Successful", data)
        }
    } catch (error) {
        console.error("Failed", error.message);
    }
}
createOrderlyKey();
//# sourceMappingURL=walletAuth.js.map