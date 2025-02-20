import ArpaElement from '../../arpaElement/arpaElement.js';
import { appendNodes, defineCustomElement } from '@arpadroid/tools';
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
        appendNodes(this, this.getChildElements());
        this.setAttribute('role', 'progressbar');
        const label = this.getProperty('label');
        label && this.setAttribute('aria-label', label.toString());
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

defineCustomElement('circular-preloader', CircularPreloader);

export default CircularPreloader;
