const path = require('path');

module.exports = [
  {
    mode: 'development',
    entry: './src/renderer/index.js',
    target: 'electron-renderer',
    output: {
      path: path.resolve(__dirname, 'build/renderer'),
      filename: 'index.js'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,       // ✅ 加這段
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    }
  },
  {
    mode: 'development',
    entry: './src/main/index.js',
    target: 'electron-main',
    output: {
      path: path.resolve(__dirname, 'build/main'),
      filename: 'index.js'
    }
  }
];
