module.exports = {
  parser: "babel-eslint",
  env: {
    node: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-return-await":"off",
    "class-methods-use-this":"off",
    "no-unused-expressions" :[2,{
      "allowShortCircuit":true,
      "allowTernary":true
    }],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }]
  },
};
