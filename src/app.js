/* eslint-disable no-console */
import express from 'express';
import moment from 'moment';
import config from './config';
import appLoaders from './loaders';

async function startServer() {
  const app = express();
  const now = moment();

  console.log('Initializing application');
  console.log(config);
  await appLoaders({ expressApp: app });

  app.listen(config.port, async () => {
    try {
      console.log(`
      ####################################################################
      🛡️  Server listening on port: ${config.port} with feature level ${config.featureLevel}, 
          server start took ${moment().diff(now)} ms 🛡️ 
      ####################################################################`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
}

startServer();
