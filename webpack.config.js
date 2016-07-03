module.exports = {
  entry: {
    web: './src/entries/main.js',
    admin: './src/entries/admin-main.js',
    init: './src/entries/init.js'
  },
  output: {
    path: __dirname + '/build/',
    filename: '[name]-build.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  babel: {
    presets: [ 'es2015' ]
  }
}
