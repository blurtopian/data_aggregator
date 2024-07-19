const { KoiiStorageClient } = require('@_koii/storage-task-sdk');
const simpleGit = require('simple-git');
const git = simpleGit();


class SimpleClonerTask {
  constructor(repo) {
    this.repo = repo;
  }

  async retrieveAndValidateFile(cid, filename = 'dealsData.json') {
    // instantiate the storage client
    const client = new KoiiStorageClient();

    try {
      // get the uploaded file using the IPFS CID we stored earlier and the filename (in this case, `dealsData.json`)
      const upload = await client.getFile(cid, filename);
      // return whether or not the file exists
      return !!upload;
    } catch (error) {
      console.error('Failed to download or validate file from IPFS:', error);
      throw error;
    }
  }

  async getLatestCommit() {
    try {
      // Clone the repository to a temporary directory (or just use a local repo)
      await git.clone(remoteUrl, 'temp-repo', ['--depth', '1']);

      // Change the working directory to the cloned repository
      git.cwd('temp-repo');

      // Get the latest commit
      const log = await git.log({ maxCount: 1 });
      console.log('Latest Commit:', log.latest);
      return log.latest
    } catch (error) {
      console.error('Error fetching latest commit:', error);
    } finally {
      // Clean up: remove the temporary directory if needed
      // (Implement cleanup logic here if desired)
    }
  }
}

module.exports = SimpleClonerTask;
