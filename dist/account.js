import { BASE_URL } from './config.js';
import { signAndSendRequest } from './signer.js';
export async function getClientHolding(orderlyAccountId, orderlyKey) {
    const res = await signAndSendRequest(orderlyAccountId, orderlyKey, `${BASE_URL}/v1/client/holding`);
    const json = await res.json();
    console.log('getClientHolding:', JSON.stringify(json, undefined, 2));
}
export async function getOpenOrders(orderlyAccountId, orderlyKey) {
    const res = await signAndSendRequest(orderlyAccountId, orderlyKey, `${BASE_URL}/v1/orders?status=INCOMPLETE`);
    const json = await res.json();
    console.log('getOpenOrders:', JSON.stringify(json, undefined, 2));
    return json.data.rows;
}
export async function getOpenAlgoOrders(algoType, orderlyAccountId, orderlyKey
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    const res = await signAndSendRequest(orderlyAccountId, orderlyKey, `${BASE_URL}/v1/algo/orders?status=INCOMPLETE&algo_type=${algoType}`);
    const json = await res.json();
    console.log('getOpenAlgoOrders:', JSON.stringify(json, undefined, 2));
    return json.data.rows;
}
//# sourceMappingURL=account.js.map