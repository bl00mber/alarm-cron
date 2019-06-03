const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const DEV = process.env.TARGET === 'dev'
const ROOT_PATH = path.resolve(__dirname)

module.exports = env => {
const MAIN = !!(env && env.main)
return {
  entry: MAIN ? path.resolve(ROOT_PATH, 'main', 'main.ts') :
                path.resolve(ROOT_PATH, 'renderer', 'renderer.tsx'),
  target: MAIN ? 'electron-main' : 'electron-renderer',
  output: {
    path: path.resolve(ROOT_PATH, 'dist'),
    filename: MAIN ? 'main.js' : 'renderer.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules']
  },
  devtool: (DEV && !MAIN) ? 'inline-source-map' : '',
  mode: (DEV && !MAIN) ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
            'url-loader?limit=100000',
            'img-loader'
          ],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
        ]
      }
    ]
  },
  devServer: (DEV && !MAIN) ? {
    publicPath: 'http://localhost:8080/dist/',
    port: '8080',
    host: '0.0.0.0',
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    index: 'src/assets/index.html'
  } : {},
  optimization: DEV ? {} : {minimizer: [new TerserPlugin()]},
  plugins: [
    new MiniCssExtractPlugin({ filename: "style.css", chunkFilename: "[id].css" }),
    ...(!MAIN ? [
      new webpack.HotModuleReplacementPlugin()
    ] : []),
    ...(DEV ? [
      new webpack.DefinePlugin({
        'process.env': {NODE_ENV: JSON.stringify('development')},
        __DEV__: true
      })
    ] : [
      new webpack.DefinePlugin({
        'process.env': {NODE_ENV: JSON.stringify('production')},
        __DEV__: false
      })
    ])
  ]
}}
