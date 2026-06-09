/**
 * @typedef {import('./circularSpinner.types.js').CircularSpinnerConfigType} CircularSpinnerConfigType
 */

import ArpaElement from '../../core/arpaElement/arpaElement.js';
import { defineCustomElement } from '@arpadroid/tools';
const html = String.raw;
class CircularSpinner extends ArpaElement {
    /** @type {CircularSpinnerConfigType} */
    _config = this._config;

    getDefaultConfig() {
        /** @type {CircularSpinnerConfigType} */
        const conf = {
            hasMask: false,
            className: 'circularSpinner',
            attributes: {
                variant: 'default',
                role: 'progressbar'
            }
        };
        return super.getDefaultConfig(conf);
    }

    $renderTemplate() {
        return html`
            <arpa-node name="mask" can-render="hasMask"></arpa-node>
            <arpa-node name="content" is-content>
                <arpa-node name="spinnerContainer">
                    <span class="circularSpinner__spinner"></span>
                </arpa-node>
                <arpa-node tag="span" name="label"></arpa-node>
            </arpa-node>
        `;
    }
}

defineCustomElement('circular-spinner', CircularSpinner);

export default CircularSpinner;
