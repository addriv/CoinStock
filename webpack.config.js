var path = require('path');

module.exports = {
  entry: './scripts.js',
  output: {
    filename: './bundle.js'
  },
  module: {
    loaders: [
      {
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '*']
  },
  externals: {
    fs: '{}',
    tls: '{}',
    net: '{}',
    console: '{}'
  }
};
