const { namespaceWrapper } = require('@_koii/namespace-wrapper');
const { simpleClonerTask } = require('../cloner/SimpleClonerTask');
const { downloadBinanceData } = require('./utils/download')

// Define the URL structure for Binance Vision data
const BASE_URL = 'https://data.binance.vision/data/spot/daily/klines/';
// https://data.binance.vision/data/spot/daily/klines/BTCUSDT/1m/BTCUSDT-1m-2024-07-18.zip
const symbol = 'BTCUSDT';
const interval = '1m';
const start = "";
const end = "";
const dateYmd = "2024-07-18";
const expectedChecksum = '392f5627796817dcdf875ca5fe89e3e8f25c01e70f3b9a018852da1d67b354ce';


const filenameChecksum = `${symbol}-${interval}-${dateYmd}.zip`;
const urlChecksum = `${BASE_URL}${symbol}/${interval}/${filenameChecksum}`;


class Audit {
  async validateNode(submission_checksum, round) {
    console.log('validateNode::submission_checksum', submission_checksum)
    try {
      const basePath = await namespaceWrapper.getBasePath();
      await downloadBinanceData(urlChecksum, `${basePath}/${filenameChecksum}`);
      const binanceChecksum = await this.readChecksum(`${basePath}/${filenameChecksum}`);
      console.log('binanceChecksum', binanceChecksum)
      return submission_checksum == binanceChecksum;
    } catch (e) {
      console.log('Error in validate:', e);
      return false;
    }
  }

  async readChecksum(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.trim()); // Remove any leading/trailing whitespace
        }
      });
    });
  }

  async auditTask(roundNumber) {
    console.log('auditTask called with round', roundNumber);
    console.log(
      await namespaceWrapper.getSlot(),
      'current slot while calling auditTask',
    );
    await namespaceWrapper.validateAndVoteOnNodes(
      this.validateNode,
      roundNumber,
    );
  }
}
const audit = new Audit();
module.exports = { audit };
