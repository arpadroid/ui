// @ts-ignore
import { getBuild, rollupCopy } from '@arpadroid/module';
const { build = {}, appBuild } = getBuild('ui', 'uiComponent');
appBuild.plugins = appBuild.plugins || [];
Array.isArray(appBuild.plugins) &&
    appBuild.plugins?.push(
        rollupCopy({
            targets: [
                { src: 'node_modules/material-symbols', dest: 'dist' },
                { src: 'src/demo.html', dest: 'dist' }
            ]
        })
    );

export default build;
