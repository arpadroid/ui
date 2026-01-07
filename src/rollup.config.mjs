import { getBuild } from '@arpadroid/module';
const { build = {}, appBuild, Plugins } = getBuild('ui');
appBuild.plugins = appBuild.plugins || [];
Array.isArray(appBuild.plugins) &&
    appBuild.plugins?.push(
        Plugins.copy({
            targets: [
                { src: 'node_modules/material-symbols', dest: 'dist' },
                { src: 'src/demo.html', dest: 'dist' }
            ]
        })
    );

export default build;
