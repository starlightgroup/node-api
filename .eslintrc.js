module.exports = {
  'parser': 'babel-eslint',
  'plugins': ['async-await','babel'],
  'env': {
    'browser': false,
    'commonjs': true,
    'es6': true,
    'node':true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'babel/new-cap': 1,
    'babel/object-curly-spacing': 1,
    'babel/no-await-in-loop': 1,
    'babel/no-invalid-this': 1,
    'require-await':[
      2
    ],
    'no-console': [
      0
    ],
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'async-await/space-after-async': 2,
    'async-await/space-after-await': 2
  },
};