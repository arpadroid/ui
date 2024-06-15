import copy from 'rollup-plugin-copy';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import fs from 'fs';

const cwd = process.cwd();
const formsScript = cwd + '/node_modules/@arpadroid/forms/dist/forms.js';
const formsScriptExists = fs.existsSync(formsScript);
const copyPatterns = [
    formsScriptExists && { src: 'node_modules/@arpadroid/forms/dist/themes', dest: 'dist/forms' },
    formsScriptExists && { src: 'node_modules/@arpadroid/forms/dist/forms.js', dest: 'dist/forms' }
].filter(Boolean);

export default [
    {
        input: 'src/index.js',
        plugins: [
            terser(),
            nodeResolve(),
            copy({
                targets: [
                    { src: 'node_modules/material-symbols', dest: 'dist' },
                    { src: 'src/demo.html', dest: 'dist' },
                    { src: 'src/lang', dest: 'dist' },
                    ...copyPatterns
                ]
            })
        ],
        output: {
            file: 'dist/arpadroid-ui.js',
            format: 'es'
        }
    },
    {
        input: './src/types.d.ts',
        output: [{ file: 'dist/types.d.ts', format: 'es' }],
        plugins: [dts()]
    }
];
