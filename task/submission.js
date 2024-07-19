const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { namespaceWrapper } = require('@_koii/namespace-wrapper');
const { KoiiStorageClient } = require('@_koii/storage-task-sdk');

// Define the URL structure for Binance Vision data
const BASE_URL = 'https://data.binance.vision/data/spot/daily/klines/';
const symbol = 'BTCUSDT';
const interval = '1d'; // daily data
const year = 2021; // Year of the data you want to download

// Construct the URL and filename
const url = `${BASE_URL}${symbol}/${interval}/${symbol}-${interval}-${year}.zip`;
const filename = path.join(__dirname, `${symbol}-${interval}-${year}.zip`);

class Submission {
  constructor() {}

  async task(round) {
    try {

      console.log(`Downloading data from ${url}...`);
      let result = await this.downloadBinanceData(url, filename);
      console.log(`Data saved to ${filename}`);

      // const cid = await this.storeFile(result);
      // await namespaceWrapper.storeSet("cid", cid);

      return 'Done';
    } catch (err) {
      console.error('ERROR IN EXECUTING TASK', err);
      return 'ERROR IN EXECUTING TASK' + err;
    }
  }

  async storeFile(data, filename = 'dealsData.json') {
    const basePath = await namespaceWrapper.getBasePath();
    try {
      const client = new KoiiStorageClient();
      fs.writeFileSync(`${basePath}/${filename}`, JSON.stringify(data));

      const userStaking = await namespaceWrapper.getSubmitterAccount();
      const { cid } = await client.uploadFile(`${basePath}/${filename}`,userStaking);

      console.log(`Stored file CID: ${cid}`);
      fs.unlinkSync(`${basePath}/${filename}`);

      return cid;
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      fs.unlinkSync(`${basePath}/${filename}`);
      throw error;
    }
  }

  // Function to download data from Binance Vision
  async downloadBinanceData(url, filename) {
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

  async submitTask(roundNumber) {
    console.log('submitTask called with round', roundNumber);
    try {
      const submission = await this.fetchSubmission(roundNumber);
      console.log('SUBMISSION', submission);
      await namespaceWrapper.checkSubmissionAndUpdateRound(
        submission,
        roundNumber,
      );

      console.log('after the submission call');
    } catch (error) {
      console.log('error in submission', error);
    }
  }

  async fetchSubmission(round) {
    console.log('fetchSubmission called with round', round);
    const cid = await namespaceWrapper.storeGet('cid');
    console.log('cid', cid);
    return cid;
  }
}

const submission = new Submission();
module.exports = { submission };
