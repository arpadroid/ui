/**
 * @typedef {import('./circularProgress.types.js').CircularProgressConfigType} CircularProgressConfigType
 */

import CircularSpinner from '../circularSpinner/circularSpinner.js';
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
const html = String.raw;

class CircularProgress extends CircularSpinner {
    /** @type {CircularProgressConfigType} */
    _config = this._config;

    /**
     * Returns the default configuration for the circular progress component.
     * @returns {CircularProgressConfigType}
     */
    getDefaultConfig() {
        /** @type {CircularProgressConfigType} */
        const config = {
            className: 'circularSpinner',
            classNames: ['circularProgress', 'base-preloader'],
            progress: 0,
            attributes: {
                role: 'progressbar',
                'aria-valuemin': '0',
                'aria-valuemax': '100',
                'aria-valuenow': '0'
            }
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }

    /**
     * Sets the progress value (0–100) and updates the display.
     * @param {number} value
     */
    setProgress(value) {
        const clamped = Math.min(100, Math.max(0, value));
        this.setAttribute('progress', String(clamped));
    }

    getProgress() {
        const progress = parseFloat(this.getProp('progress') ?? '') || 0;
        return isNaN(progress) ? 0 : progress;
    }

    /**
     * Updates the progress display based on the current progress value.
     * @param {number} value
     */
    updateProgress(value = this.getProgress()) {
        const clamped = Math.min(100, Math.max(0, value));
        /** @type {SVGCircleElement | null} */
        const fill = this.querySelector('.circularSpinner__fill');
        const percentage = this.querySelector('.circularProgress__percentage');
        if (fill) {
            fill.style.strokeDasharray = `${clamped} 100`;
        }
        if (percentage) {
            percentage.textContent = `${Math.round(clamped)}%`;
        }
        this.setAttribute('aria-valuenow', String(clamped));
    }

    $progress() {
        return html`<span class="circularProgress__percentage">0%</span>`;
    }

    $loader() {
        return html`${super.$loader()}${this.$progress()}`;
    }

    ///////////////////////////////
    // #region Lifecycle
    ///////////////////////////////

    static get observedAttributes() {
        return ['progress'];
    }

    /**
     * Handles attribute changes and updates progress when the 'progress' attribute changes.
     * @param {string} name
     * @param {string} _oldValue
     * @param {string} _newValue
     */
    attributeChangedCallback(name, _oldValue, _newValue) {
        name === 'progress' && this.updateProgress();
    }

    async $initializeNodes() {
        this.updateProgress();
        return true;
    }

    // #endregion
}

defineCustomElement('circular-progress', CircularProgress);

export default CircularProgress;
