const path = require('path');
const webpack = require('webpack');
const globby = require('globby');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 输出文件夹
const DIST_DIR = 'dist';
// vue入口文件
const SPA_DIR_PATTERN = '!pages/spa';
const LIB_DIR_PATTERN = '!pages/**/lib';
const COMPONENTS_DIR_PATTERN = '!pages/**/components';

// js脚本文件入口
const SCRIPTS_PATTERNS = [
  './pages/**/*{.js,.jsx}',
  // 排除以下路径
  LIB_DIR_PATTERN,
  COMPONENTS_DIR_PATTERN,
  SPA_DIR_PATTERN,
];
const STYLES_PATTERNS = [
  './pages/**/*.less',
  // 排除以下路径
  LIB_DIR_PATTERN,
  COMPONENTS_DIR_PATTERN,
  SPA_DIR_PATTERN,
];

// 单页引用路径
const SPA_PATTERNS = ['./pages/spa/index.js'];

const scriptFiles = globby.sync(SCRIPTS_PATTERNS);
const styleFiles = globby.sync(STYLES_PATTERNS);
const spaFiles = globby.sync(SPA_PATTERNS);

function getFilePathMap(filePaths, query = '') {
  const map = {};
  for (const filePath of filePaths) {
    map[filePath] = filePath + query;
  }
  return map;
}

function makeFilename(info) {
  const file = info.chunk.name;
  const dir = path.dirname(file);
  const ext = path.extname(file).toLowerCase();
  const basename = path.basename(file, ext);
  // 如果是 mini-css-extract-plugin 插件产生的无用脚本，就在文件名后加个标志，防止误用

  let filename;

  if (['.less', '.css'].includes(ext)) {
    if ('css/mini-extract' in info.chunk.contentHash) {
      filename = `${dir}/${basename}.mini_css_cache.js`;
    } else {
      filename = `${dir}/${basename}.css.js`;
    }
  } else {
    filename = `${dir}/${basename}.js`;
  }

  return filename;
}

const baseConfig = {
  mode: process.env.NODE_ENV || 'development',
  devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
  target: 'es5',
  cache: true,
};

module.exports = {
  ...baseConfig,
  entry: {
    ...getFilePathMap(scriptFiles),
    ...getFilePathMap(styleFiles, '?css_assets'),
    ...getFilePathMap(spaFiles),
  },
  output: {
    path: path.resolve(__dirname, DIST_DIR),
    filename: makeFilename,
    libraryTarget: 'umd',
    globalObject: 'this',
    publicPath: '/',
  },
  module: {
    rules: [
      // https://vue-loader.vuejs.org/zh/guide/linting.html#eslint
      /*{
        enforce: 'pre',
        test: /\.vue$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },*/
      {
        test: /\.vue?$/,
        loader: 'vue-loader',
      },

      {
        test: /\.(le|c)ss?$/,
        oneOf: [
          // 这里匹配独立打包的less文件 (styleFiles数组内的文件)
          {
            resourceQuery: /\?css_assets/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  url: false, // 不打包css中的外部资源(如字体、background-image: url(xxx))
                },
              },
              'less-loader',
            ],
          },
          // 这里匹配使用CSS Modules的vue单文件组件
          {
            resourceQuery: /module/,
            use: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[local]_[hash:base64:8]',
                  },
                },
              },
              'less-loader',
            ],
          },
          // 这里匹配使用普通全局style和scoped style的vue单文件组件
          {
            use: ['vue-style-loader', 'css-loader', 'less-loader'],
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|ico)(\?\S*)?$/,
        loader: 'file-loader',
        options: {
          name: '[name]-[contenthash].[ext]',
          outputPath: 'pages',
          publicPath: '/',
        },
      },
      {
        test: /\.jsx?$/,
        use: [
          // 出现语法兼容性问题时启用这个loader，但是*不推荐*，因为它会破坏源码映射
          // {
          //   loader: "buble-loader"
          // },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      ie: '8',
                      chrome: '36',
                    },
                  },
                ],
                ['@vue/babel-preset-jsx'],
              ],
              plugins: [
                [require.resolve('@babel/plugin-transform-modules-commonjs')],
                [require.resolve('@babel/plugin-transform-runtime')],
                [require.resolve('babel-plugin-preval')],
              ],
              compact: false,
            },
          },
        ],
      },
      {
        test: /\.pug$/,
        use: ['pug-plain-loader'],
      },
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new VueLoaderPlugin(),
    /* new ESLintPlugin({
      extensions: '.vue',
    }),*/
    new webpack.ProgressPlugin(),
    // new MiniCssExtractPlugin(),
    new MiniCssExtractPlugin({
      filename: (info) => {
        const file = info.chunk.name;
        const dir = path.dirname(file);
        const ext = path.extname(file).toLowerCase();
        const basename = path.basename(file, ext);
        if (['.less', '.css'].includes(ext)) {
          return `${dir}/${basename}.css`;
        } else {
          return `${dir}/${basename}${ext}.mini_css_out`;
        }
      },
    }),
  ],
  externals: {
    vue: 'Vue',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.vue', '.json', '.less', '.css'],
  },
};
