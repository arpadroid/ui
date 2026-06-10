/**
 * @typedef {import('./linearProgress.types.js').LinearProgressConfigType} LinearProgressConfigType
 */

import CircularProgress from '../circularProgress/circularProgress.js';
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
const html = String.raw;

class LinearProgress extends CircularProgress {
    /** @type {LinearProgressConfigType} */
    _config = this._config;

    /**
     * Returns the default configuration for the linear progress component.
     * @returns {LinearProgressConfigType}
     */
    getDefaultConfig() {
        /** @type {LinearProgressConfigType} */
        const config = {
            className: 'linearProgress',
            classNames: ['base-preloader']
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }

    /**
     * Updates the progress display based on the current progress value.
     * @param {number} value
     */
    updateProgress(value = this.getProgress()) {
        const clamped = Math.min(100, Math.max(0, value));
        const fill = this.querySelector('.linearProgress__fill');
        const percentage = this.querySelector('.linearProgress__percentage');

        if (fill instanceof HTMLElement) {
            fill.style.width = `${clamped}%`;
        }
        if (percentage) {
            percentage.textContent = `${Math.round(clamped)}%`;
        }
        this.setAttribute('aria-valuenow', String(clamped));
    }

    $loader() {
        return html`
            <div class="linearProgress__track" aria-hidden="true">
                <div class="linearProgress__fill"></div>
            </div>
            <span class="linearProgress__percentage">0%</span>
        `;
    }
}

defineCustomElement('linear-progress', LinearProgress);

export default LinearProgress;
