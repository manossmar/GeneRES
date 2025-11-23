const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './server.js',
  target: 'node',
  plugins: [
    new Dotenv()
  ]
};
