const fs = require('fs');
const axios = require('axios');


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

module.exports =  {
  downloadBinanceData
};
