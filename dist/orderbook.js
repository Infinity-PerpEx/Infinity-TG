import { BASE_URL } from './config.js';
import { signAndSendRequest } from './signer.js';
export async function getOrderbook(symbol, maxLevel, orderlyAccountId, orderlyKey) {
    const res = await signAndSendRequest(orderlyAccountId, orderlyKey, `${BASE_URL}/v1/orderbook/${symbol}${maxLevel != null ? `?max_level=${maxLevel}` : ''}`);
    const json = await res.json();
    console.log('getOrderbook:', JSON.stringify(json, undefined, 2));
    return json;
}
//# sourceMappingURL=orderbook.js.map