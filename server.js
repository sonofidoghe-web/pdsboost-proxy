const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.PDSBOOST_API_KEY;
const API_URL = 'https://pdsboost.com/api/v2';

app.get('/', (req, res) => {
  res.send('PdsBoost Proxy is running');
});

app.post('/api', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const body = {
      key: API_KEY,
      ...req.body
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
