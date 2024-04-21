import { randomFillSync, webcrypto } from 'crypto';

// Check if crypto.getRandomValues is available, if not, polyfill it
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
    globalThis.crypto = {
        getRandomValues: (buffer) => randomFillSync(buffer)
    };
}
