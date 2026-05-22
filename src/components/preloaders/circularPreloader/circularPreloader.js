/**
 * @typedef {import('./circularPreloader.types.js').CircularPreloaderConfigType} CircularPreloaderConfigType
 */

import ArpaElement from '../../arpaElement/arpaElement.js';
import { defineCustomElement } from '@arpadroid/tools';
const html = String.raw;
class CircularPreloader extends ArpaElement {
    /** @type {CircularPreloaderConfigType} */
    _config = this._config;

    getDefaultConfig() {
        /** @type {CircularPreloaderConfigType} */
        const conf = {
            hasMask: false,
            label: 'Loading...',
            className: 'circularPreloader',
            attributes: {
                variant: 'default',
                role: 'progressbar'
            },
            content: '',
            templateChildren: {
                mask: {
                    className: 'circularPreloader__mask',
                    canRender: 'has-mask'
                },
                container: {
                    className: 'circularPreloader__spinnerContainer',
                    content: html`<span class="circularPreloader__spinner"></span>`
                },
                content: {
                    isContent: true,
                    className: 'circularPreloader__content',
                    content: '{label}',
                }
            }
        };
        return super.getDefaultConfig(conf);
    }
}

defineCustomElement('circular-preloader', CircularPreloader);

export default CircularPreloader;
