
import config from '../../config';

export const featureLevelValue = Object.freeze({
  development: 0,
  staging: 1,
  production: 2,
});

export const featureLevel = Object.freeze({
  development: 'development',
  staging: 'staging',
  production: 'production',
});

export const isApplicableFeatureLevel = (level) => (
  featureLevelValue[config.featureLevel] <= featureLevelValue[level]
);


