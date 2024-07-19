const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { namespaceWrapper } = require('@_koii/namespace-wrapper');
const { KoiiStorageClient } = require('@_koii/storage-task-sdk');
const { downloadBinanceData } = require('./utils/download')
const { computeChecksum } = require('./utils/checksumUtil')

// Define the URL structure for Binance Vision data
const BASE_URL = 'https://data.binance.vision/data/spot/daily/klines/';
// https://data.binance.vision/data/spot/daily/klines/BTCUSDT/1m/BTCUSDT-1m-2024-07-18.zip
const symbol = 'BTCUSDT';
const interval = '1m';
const start = "";
const end = "";
const dateYmd = "2024-07-18";
const expectedChecksum = '392f5627796817dcdf875ca5fe89e3e8f25c01e70f3b9a018852da1d67b354ce';

// Construct the URL and filename
const filename = `${symbol}-${interval}-${dateYmd}.zip`;
const url = `${BASE_URL}${symbol}/${interval}/${filename}`;

class Submission {
  constructor() {}

  async task(round) {
    try {
      const basePath = await namespaceWrapper.getBasePath();
      console.log(`basePath ${basePath}...`);
      
      console.log(`Downloading data from ${url}...`);
      await downloadBinanceData(url, `${basePath}/${filename}`);
      const checksum = await computeChecksum(`${basePath}/${filename}`);
      console.log(`Data saved to ${basePath}/${filename}`);
      console.log(`CHECKSUM ${checksum}`);

      // const cid = await this.storeFile(result);
      // await namespaceWrapper.storeSet("cid", cid);

      return checksum;
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
