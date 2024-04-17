export const messageTypes = {
    EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
    ],
    Registration: [
        { name: 'brokerId', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'registrationNonce', type: 'uint256' }
    ],
    AddOrderlyKey: [
        { name: 'brokerId', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'orderlyKey', type: 'string' },
        { name: 'scope', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'expiration', type: 'uint64' }
    ],
    Withdraw: [
        { name: 'brokerId', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'receiver', type: 'address' },
        { name: 'token', type: 'string' },
        { name: 'amount', type: 'uint256' },
        { name: 'withdrawNonce', type: 'uint64' },
        { name: 'timestamp', type: 'uint64' }
    ],
    SettlePnl: [
        { name: 'brokerId', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'settleNonce', type: 'uint64' },
        { name: 'timestamp', type: 'uint64' }
    ]
};
//# sourceMappingURL=eip712.js.map