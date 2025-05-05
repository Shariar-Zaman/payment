const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const bkashConfig = {
  app_key: 'your_app_key',
  app_secret: 'your_app_secret',
  username: 'your_username',
  password: 'your_password',
  base_url: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
};

let id_token = ''; // Will store the auth token

// 1. Get Auth Token
async function getAuthToken() {
  const res = await axios.post(`${bkashConfig.base_url}/tokenized/checkout/token/grant`, {
    app_key: bkashConfig.app_key,
    app_secret: bkashConfig.app_secret,
  }, {
    headers: {
      username: bkashConfig.username,
      password: bkashConfig.password,
      'Content-Type': 'application/json',
    },
  });
  id_token = res.data.id_token;
}

// 2. Create Payment
app.post('/bkash/create-payment', async (req, res) => {
  try {
    if (!id_token) await getAuthToken();

    const paymentRequest = {
      mode: '0011',
      payerReference: 'user001',
      callbackURL: 'http://localhost:4242/bkash/callback',
      amount: '10',
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: 'INV1234',
    };

    const paymentRes = await axios.post(`${bkashConfig.base_url}/tokenized/checkout/create`, paymentRequest, {
      headers: {
        'Content-Type': 'application/json',
        authorization: id_token,
        'x-app-key': bkashConfig.app_key,
      },
    });

    res.json(paymentRes.data);
  } catch (
