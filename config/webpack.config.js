const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PRODUCTION_MODE = process.env.NODE_ENV === 'production';

const pkgResolve = pkgPath =>
  path.resolve(__dirname, path.join('../packages/', pkgPath));
const srcResolve = pkgPath =>
  path.resolve(__dirname, path.join('../src/', pkgPath));

const createConfig = ({
  nodemon,
  target,
  entryName,
  mainFile,
  outputFile,
  outputPath = '',
  plugins = [],
}) => ({
  target,
  mode: PRODUCTION_MODE ? 'production' : 'development',
  watch: !PRODUCTION_MODE,
  devtool: PRODUCTION_MODE ? 'cheap-source-map' : 'eval-source-map',
  entry: {
    [entryName]: srcResolve(mainFile),
  },
  output: {
    filename: outputFile,
    publicPath: '',
    path: path.resolve(__dirname, '../dist', outputPath || ''),
  },
  module: {
    rules: [
      {
        test: /\.asm$/i,
        use: 'raw-loader',
      },
      {
        test: /\.(bin|flp)/,
        use: 'arraybuffer-loader',
      },
      {
        test: /\.(png|jpe?g|gif|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/',
              emitFile: true,
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          onlyCompileBundledFiles: true,
          configFile: path.resolve(__dirname, '../tsconfig.json'),
        },
      },
    ],
  },
  externals: target === 'node' ? [nodeExternals()] : [],
  node: {
    __dirname: false,
  },
  plugins: [
    ...(target === 'node'
      ? []
      : [
          new HtmlWebpackPlugin({
            title: 'Emulator',
          }),
        ]),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      exclude: ['node_modules'],
    }),
    new CircularDependencyPlugin(),
    ...plugins,
    ...(nodemon
      ? [
          new NodemonPlugin({
            watch: 'dist',
          }),
        ]
      : []),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@compiler/core': pkgResolve('compiler-core/src/'),
      '@compiler/lexer': pkgResolve('compiler-lexer/src/'),
      '@compiler/grammar': pkgResolve('compiler-grammar/src/'),
      '@compiler/rpn': pkgResolve('compiler-rpn/src/'),
      '@compiler/pico-c': pkgResolve('compiler-pico-c/src'),
      '@x86-toolkit/cpu': pkgResolve('x86-toolkit/x86-cpu/src'),
      '@x86-toolkit/assembler': pkgResolve('x86-toolkit/x86-assembler/src/'),
      '@ui/context-state': pkgResolve('ui-context-state/src'),
      '@ui/webapp': pkgResolve('ui-webapp/src'),
      '@client': srcResolve('client'),
      '@server': srcResolve('server'),
    },
    ...(target !== 'node' && {
      fallback: {
        path: false,
        fs: false,
      },
    }),
  },
});

module.exports = [
  createConfig({
    target: 'node',
    entryName: 'cli',
    mainFile: 'cli.ts',
    outputFile: 'cli.js',
    nodemon: true,
  }),
  createConfig({
    entryName: 'web',
    mainFile: 'web/index.tsx',
    outputFile: 'web.js',
    nodemon: false,
  }),
];
