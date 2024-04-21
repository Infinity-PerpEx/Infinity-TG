import { BASE_URL } from './config.js';
import { signAndSendRequest } from './signer.js';
export async function createOrder(symbol, orderType, side, orderPrice, orderQuantity, orderlyAccountId, orderlyKey) {
    const body = {
        symbol,
        order_type: orderType,
        side,
        order_price: orderPrice,
        order_quantity: orderQuantity
    };
    console.log('creating order', JSON.stringify(body, undefined, 2));
    const res = await signAndSendRequest(orderlyAccountId, orderlyKey, `${BASE_URL}/v1/order`, {
        method: 'POST',
        body: JSON.stringify(body)
    });
    const json = await res.json();
    console.log('createOrder:', JSON.stringify(json, undefined, 2));
     // Return the response json object to the caller
     return json;
}
export async function createAlgoOrder(body, orderlyAccountId, orderlyKey) {
    console.log('creating algo order', JSON.stringify(body, undefined, 2));
    const res = await signAndSendRequest(orderlyAccountId, orderlyKey, `${BASE_URL}/v1/algo/order`, {
        method: 'POST',
        body: JSON.stringify(body)
    });
    const json = await res.json();
    console.log('createAlgoOrder:', JSON.stringify(json, undefined, 2));
}
export async function cancelOrder(orderId, symbol, orderlyAccountId, orderlyKey) {
    const res = await signAndSendRequest(orderlyAccountId, orderlyKey, `${BASE_URL}/v1/order?order_id=${orderId}&symbol=${symbol}`, {
        method: 'DELETE'
    });
    const json = await res.json();
    console.log('cancelOrder:', JSON.stringify(json, undefined, 2));
}
export async function cancelAlgoOrder(orderId, symbol, orderlyAccountId, orderlyKey) {
    const res = await signAndSendRequest(orderlyAccountId, orderlyKey, `${BASE_URL}/v1/algo/order?order_id=${orderId}&symbol=${symbol}`, {
        method: 'DELETE'
    });
    const json = await res.json();
    console.log('cancelAlgoOrder:', JSON.stringify(json, undefined, 2));
}
//# sourceMappingURL=order.js.map