/* eslint-disable no-console */
import convict from 'convict';
import dotenv from 'dotenv';

dotenv.config();

const configLoader = convict({
  env: {
    format: ['prod', 'dev', 'stage'],
    default: 'dev',
    arg: 'nodeEnv',
    env: 'NODE_ENV',
  },
  port: {
    format: 'port',
    default: 8080,
    env: 'PORT',
  },
  featureLevel: {
    format: ['development', 'staging', 'production'],
    default: 'development',
    env: 'FEATURE_LEVEL',
  },
  db: {
    credentials: {
      user: {
        format: String,
        default: '',
        env: 'DB_USER',
      },
      password: {
        format: String,
        default: '',
        env: 'DB_PASSWORD',
      },
    },
    host: {
      format: String,
      default: '',
      env: 'DB_HOST',
    },
    name: {
      format: String,
      default: '',
      env: 'DB_NAME',
    },
    port: {
      format: 'port',
      default: 5432,
      env: 'DB_PORT',
    },
  },
  authTokens: {
    privateKey: {
      format: '*',
      default: '',
      env: 'JWT_PRIVATE_KEY',
    },
    publicKey: {
      format: '*',
      default: '',
      env: 'JWT_PUBLIC_KEY',
    },
    issuer: {
      format: String,
      default: '[project_name]',
    },
    algorithm: {
      format: String,
      default: 'ES512',
    },
    audience: {
      web: {
        format: String,
        default: 'WEB',
      },
      app: {
        format: String,
        default: 'APP',
      },
    },
    version: {
      format: 'int',
      default: 1,
    },
  },
  encryptionKey: {
    format: String,
    default: '',
    env: 'ENCRYPTION_KEY',
  },
});

configLoader.validate({ allowed: 'strict' });
const config = configLoader.getProperties();
export default config;
