import axios from 'axios';

const url = 'https://testnet-operator-evm.orderly.org/v1/faucet/usdc';
const data = {
  chain_id: '421614',
  broker_id: 'woofi_pro',
  user_address: '0xDCD05765146D5057D6B7aB1B7617094BA9fdd003'
};

axios.post(url, JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
