const { execSync } = require('child_process');
const argv = require('yargs').argv;
const MODE = argv.mode === 'production' ? 'production' : 'development';
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const StylesheetBundler = require('@arpadroid/stylesheet-bundler');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const cwd = process.cwd();

const basePath = cwd + '/src/themes';
const bundler = new StylesheetBundler.ThemesBundler({
    themes: [
        { path: basePath + '/default' }
        // { path: basePath + '/dark' }
    ],
    patterns: [cwd + '/src/components/**/*', cwd + '/src/modules/**/*'],
    minify: MODE === 'production',
    commonThemePath: basePath + '/common'
});

const themeExt = MODE === 'production' ? 'min.css' : 'bundled.css';
if (MODE === 'production') {
    execSync('npm run build:types');
}

const formsScript = cwd + '/../forms/dist/forms.js';
const formsScriptExists = fs.existsSync(formsScript);

const copyPatterns = [
    formsScriptExists && {
        from: `../forms/dist/forms.js`,
        to: cwd + `/dist/forms.js`
    },
    formsScriptExists && {
        from: `../forms/dist/themes`,
        to: cwd + `/dist/forms/themes`
    }
].filter(Boolean);

module.exports = (async () => {
    await bundler.initialize();
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
            watchOptions: {
                ignored: ['*.css']
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
                    }
                    // {
                    //     test: /\.(scss|css)$/,
                    //     //      exclude: [`${cwd}/src/assets/ngivr.scss`],
                    //     use: [
                    //         {
                    //             loader: MiniCssExtractPlugin.loader,
                    //             options: {}
                    //         },
                    //         'css-loader'
                    //     ]
                    // }
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
                            from: `src/themes/default/fonts`,
                            to: cwd + `/dist/themes/default/fonts`
                        },
                        {
                            from: 'src/types.compiled.d.ts',
                            to: cwd + '/dist/types.d.ts'
                        },
                        ...copyPatterns
                    ]
                })
                // new MiniCssExtractPlugin({
                //     filename: 'themes/default/default.min.css'
                // })
            ]
        }
    ];
})();
