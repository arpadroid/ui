const StylesheetBundler = require('@arpadroid/stylesheet-bundler');
const argv = require('yargs').argv;
const cwd = process.cwd();
const MINIFY = Boolean(argv.minify);

const basePath = cwd + '/src/themes';
const bundler = new StylesheetBundler.ThemesBundler({
    themes: [
        { path: basePath + '/default' }
        // { path: basePath + '/dark' }
    ],
    patterns: [cwd + '/src/components/**/*', cwd + '/src/modules/**/*'],
    minify: MINIFY,
    commonThemePath: basePath + '/common',
    exportPath: cwd + '/dist/themes'
});
async function initialize() {
    return await bundler.initialize();
}
initialize();