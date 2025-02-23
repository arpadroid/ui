import copy from './node_modules/@arpadroid/module/node_modules/rollup-plugin-copy/dist/index.commonjs.js';
import { getBuild } from '@arpadroid/module/src/rollup/builds/rollup-builds.mjs';
const { build, appBuild } = getBuild('ui', 'uiComponent');
appBuild.plugins.push(
    copy({
        targets: [
            { src: 'node_modules/material-symbols', dest: 'dist' },
            { src: 'src/demo.html', dest: 'dist' }
            //{ src: 'src/lang', dest: 'dist' },
        ]
    })
);

export default build;
