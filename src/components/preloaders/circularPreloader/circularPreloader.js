import ArpaElement from '../../arpaElement/arpaElement.js';
import { appendNodes } from '@arpadroid/tools';
const html = String.raw;
class CircularPreloader extends ArpaElement {
    getDefaultConfig() {
        return {
            hasMask: false,
            variant: 'default',
            label: 'Loading...',
            text: '',
            template: html`
                {mask}
                <div class="circularPreloader__spinnerContainer">
                    <span class="circularPreloader__spinner"></span>
                    {text}
                </div>
            `
        };
    }

    _initialize() {
        this.classList.add('circularPreloader');
    }

    _initializeNodes() {
        appendNodes(this, this._childNodes);
        this.setAttribute('role', 'progressbar');
        this.setAttribute('aria-label', this.getProperty('label'));
        this.contentNode = this.querySelector('.circularPreloader__content');
    }

    getTemplateVars() {
        const text = this.getProperty('text') || '';
        const hasContent = text || this._childNodes?.length;
        return {
            text: hasContent && html`<div class="circularPreloader__content">${text}</div>`,
            mask: this.hasMask() && html`<div class="circularPreloader__mask"></div>`
        };
    }

    hasMask() {
        return this.hasProperty('has-mask');
    }
}

customElements.define('circular-preloader', CircularPreloader);

export default CircularPreloader;
