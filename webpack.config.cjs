const { execSync } = require('child_process');
const argv = require('yargs').argv;
const MODE = argv.mode === 'production' ? 'production' : 'development';
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const StylesheetBundler = require('@arpadroid/stylesheet-bundler');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const cwd = process.cwd();

const basePath = cwd + '/src/themes';
const bundler = new StylesheetBundler.ThemesBundler({
    themes: [
        { path: basePath + '/default' }
        // { path: basePath + '/dark' }
    ],
    patterns: [cwd + '/src/components/**/*'],
    minify: MODE === 'production',
    commonThemePath: basePath + '/common'
});

const themeExt = MODE === 'production' ? 'min.css' : 'bundled.css';
if (MODE === 'production') {
    execSync('npm run build:types');
}

module.exports = (async () => {
    await bundler.promise;
    bundler.cleanup();
    await bundler.bundle();
    if (MODE === 'development') {
        bundler.watch();
    }
    return [
        {
            entry: './src/index.js',
            target: 'web',
            mode: MODE,
            stats: 'errors-only',
            devServer: {
                port: 9003,
                hot: true,
                open: true,
                watchFiles: ['src/**/*'],
                static: {
                    directory: path.join(__dirname, 'dist')
                }
            },
            experiments: {
                outputModule: true
            },
            resolve: {
                extensions: ['.js']
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader'
                        }
                    },
                    {
                        test: /\.(svg|eot|woff|ttf|svg|woff2)$/,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: 'fonts/[name].[ext]'
                                }
                            }
                        ]
                    },
                    {
                        test: /\.(scss|css)$/,
                        //      exclude: [`${cwd}/src/assets/ngivr.scss`],
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {}
                            },
                            'css-loader'
                        ]
                    }
                ]
            },
            cache: {
                type: 'filesystem'
            },
            output: {
                path: path.resolve(__dirname, 'dist'),
                clean: true,
                module: true,
                publicPath: '/',
                filename: 'arpadroid-ui.js',
                library: {
                    type: 'module'
                }
            },
            plugins: [
                new HtmlWebpackPlugin({
                    template: 'src/demo.ejs',
                    inject: false
                }),
                new webpack.optimize.ModuleConcatenationPlugin(),
                new webpack.DefinePlugin({
                    APPLICATION_MODE: JSON.stringify(MODE)
                }),
                new CopyPlugin({
                    patterns: [
                        {
                            from: 'src/lang',
                            to: 'lang'
                        },
                        {
                            from: 'node_modules/material-symbols',
                            to: cwd + '/dist/material-symbols'
                        },
                        {
                            from: `src/themes/default/default.${themeExt}`,
                            to: cwd + `/dist/themes/default/default.${themeExt}`
                        },
                        {
                            from: 'src/types.compiled.d.ts',
                            to: cwd + '/dist/types.d.ts'
                        }
                    ]
                }),
                new MiniCssExtractPlugin({
                    // filename: 'themes/default/default.min.css'
                })
            ]
        }
    ];
})();
