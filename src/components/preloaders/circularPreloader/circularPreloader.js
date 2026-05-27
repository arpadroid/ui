/**
 * @typedef {import('./circularPreloader.types.js').CircularPreloaderConfigType} CircularPreloaderConfigType
 */

import ArpaElement from '../../core/arpaElement/arpaElement.js';
import { defineCustomElement } from '@arpadroid/tools';
const html = String.raw;
class CircularPreloader extends ArpaElement {
    /** @type {CircularPreloaderConfigType} */
    _config = this._config;

    getDefaultConfig() {
        /** @type {CircularPreloaderConfigType} */
        const conf = {
            hasMask: false,
            className: 'circularPreloader',
            attributes: {
                variant: 'default',
                role: 'progressbar'
            },
            content: ''
        };
        return super.getDefaultConfig(conf);
    }

    _getTemplate() {
        return html`
            <arpa-node name="mask" can-render="hasMask"></arpa-node>
            <arpa-node name="spinnerContainer" is-content>
                <span class="circularPreloader__spinner"></span>
                <arpa-node tag="span" name="label" can-render="label">{label}</arpa-node>
            </arpa-node>
        `;
    }
}

defineCustomElement('circular-preloader', CircularPreloader);

export default CircularPreloader;
