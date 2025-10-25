const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  devtool: 'source-map',

  entry: {
    extension: './src/extension.ts',
    server: './src/server.ts'
  },

  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js',
    library: {
      type: 'commonjs2'
    },
    clean: false // Keep other artifacts (e.g. server.js) in out directory
  },

  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  // Only externalize the vscode module; bundle every other dependency
  externals: [
    {
      vscode: 'commonjs vscode'
    }
  ],

  optimization: {
    minimize: false,
    splitChunks: false
  },

  node: {
    __dirname: false,
    __filename: false
  },

  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }
};
