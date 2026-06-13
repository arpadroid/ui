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
            classNames: ['base-preloader'],
            variant: 'primary',
            attributes: {
                role: 'progressbar'
            }
        };
        return super.getDefaultConfig(conf);
    }

    $renderTemplate() {
        return html`
            <arpa-node name="mask" can-render="hasMask"></arpa-node>
            <arpa-node name="content" is-content>
                <arpa-node name="loaderContainer">{renderLoader()}</arpa-node>
                <arpa-node tag="span" name="label"></arpa-node>
            </arpa-node>
        `;
    }

    renderLoader() {
        return html`<svg
            class="circularSpinner__spinner"
            viewBox="0 0 36 36"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle class="circularSpinner__track" cx="18" cy="18" r="15.9155" />
            <circle class="circularSpinner__fill" cx="18" cy="18" r="15.9155" />
        </svg>`;
    }
}

defineCustomElement('circular-spinner', CircularSpinner);

export default CircularSpinner;
