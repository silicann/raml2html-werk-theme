const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: [
    './assets/docs.js'
  ],
  output: {
    path: path.join(__dirname, 'dist', 'assets'),
    publicPath: './',
    chunkFilename: './assets/[name].docs.js',
    filename: 'docs.js'
  },
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        use: { loader: 'file-loader' }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: { loader: 'babel-loader' }
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'less-loader',
            options: {
              strictMath: true,
              strictUnits: true,
              noIeCompat: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'docs.css'
    })
  ],
  devServer: {
    contentBase: './dist'
  }
}
