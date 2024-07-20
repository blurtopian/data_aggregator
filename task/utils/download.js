const fs = require('fs');
const axios = require('axios');
const BASE_URL = 'https://data.binance.vision/data/spot/daily/klines/';

// Function to download data from Binance Vision
async function downloadBinanceData(url, filename) {
  const writer = fs.createWriteStream(filename);
  
  const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
  });
}


// Construct the URL and filename
// const filename = `${symbol}-${interval}-${dateYmd}.zip`;
// const url = `${BASE_URL}${symbol}/${interval}/${filename}`;

function generateDownloadUrls(tradingPairs, tradingIntervals) {
  const flatArray = [];

  for (let i = 0; i < tradingPairs.length; i++) {
    const symbol = tradingPairs[i];

    for (let j = 0; j < tradingIntervals.length; j++) {
      const interval = tradingIntervals[j];

      const filename = `${symbol}-${interval}-${dateYmd}.zip`;
      const url = `${BASE_URL}${symbol}/${interval}/${filename}`;
      flatArray.push(url);
    }
  }
  tradingPairs.array.forEach(element => {
    
  });
}

module.exports =  {
  downloadBinanceData
};
