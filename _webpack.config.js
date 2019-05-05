import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import TerserPlugin from 'terser-webpack-plugin'

const common = {
  entry: path.resolve(ROOT_PATH, 'src/index.js'),
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['node_modules']
  },
  output: {
    path: path.resolve(ROOT_PATH, 'dist'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
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
      }
    ]
  }
}


if (TARGET === 'dev') {
  module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      publicPath: 'http://localhost:3000/dist/',
      port: '3000',
      host: '0.0.0.0',
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          loader: 'style-loader!css-loader!sass-loader'
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development')
        },
        __DEV__: true
      })
    ]
  });
}


if (TARGET === 'build') {
  module.exports = merge(common, {
    mode: 'production',
    entry: {
      'alarm': path.resolve(ROOT_PATH, 'src/main/main.js')
    },
    optimization: {},
    output: {
      path: path.resolve(ROOT_PATH, 'dist'),
      filename: 'app.js',
      library: 'alarm',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            'sass-loader'
          ]
        }
      ]
    },
    optimization: {
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        },
        __DEV__: false
      }),
      new MiniCssExtractPlugin({
        filename: "style.css",
        chunkFilename: "[id].css"
      })
    ]
  });
}
