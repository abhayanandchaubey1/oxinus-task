/* eslint-disable no-console */
import cmd from 'node-cmd';
import {Promise} from "bluebird";
import { argv } from 'yargs';
import Database from '../db'

const getAsyncCmd = Promise.promisify(cmd.run, { multiArgs: true, context: cmd });

const migrate = async () => {
  console.info('Initializing database migrations...');
  const data = await getAsyncCmd('npm run db:migrate');
  data.forEach((line) => { console.info(line); });
  console.log('Database migrations complete.');
};

const clean = async () => {
  console.warn('CREATING DATABASE FROM SCRATCH, ALL DATA WILL BE LOST!');
  const data = await getAsyncCmd('npm run db:clean');
  data.forEach((line) => { console.info(line); });
  console.log('Data dropped, proceeding');
};

export default async () => {
  const db = new Database();
  try {
    await db.testConnection();

    switch (argv.migrate) {
      case 'migrate':
        await migrate();
        break;
      case 'clean_and_migrate':
        await clean();
        await migrate();
        break;
      default:
        console.info('No database migrations requested, skipping migrations.');
        break;
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  return db;
};
