const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'lib', to: 'lib' },
        { from: 'node_modules/marx-css/css', to: 'assets' },
      ],
    }),
    new HtmlWebpackPlugin({
      inject: 'head',
      template: 'index.html',
    }),
    new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
  ],
  optimization: { minimize: false },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
}
