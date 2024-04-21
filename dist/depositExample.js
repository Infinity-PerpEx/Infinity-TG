import { config } from 'dotenv';
import { ethers, keccak256 } from 'ethers';
import { Vault__factory, NativeUSDC__factory } from './abi/index.js';
const brokerId = 'woofi_dex';
const tokenId = 'USDC';
const orderlyAccountId = '0x9e49aca3ca04bcec92fa5c494dd1e68a52b29d35740c27c27a38779ce95388f8';
const usdcAddress = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';
const vaultAddress = '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f';
config();
async function deposit() {
    const provider = new ethers.JsonRpcProvider('https://arbitrum-sepolia.publicnode.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const usdcContract = NativeUSDC__factory.connect(usdcAddress, wallet);
    const depositAmount = 100000000n;
    await usdcContract.approve(vaultAddress, depositAmount);
    const vaultContract = Vault__factory.connect(vaultAddress, wallet);
    const encoder = new TextEncoder();
    const depositInput = {
        accountId: orderlyAccountId,
        brokerHash: keccak256(encoder.encode(brokerId)),
        tokenHash: keccak256(encoder.encode(tokenId)),
        tokenAmount: depositAmount
    };
    // get wei deposit fee for `deposit` call
    const depositFee = await vaultContract.getDepositFee(wallet.address, depositInput);
    // deposit USDC into Vault contract
    await vaultContract.deposit(depositInput, { value: depositFee });
}
deposit();
//# sourceMappingURL=depositExample.js.map