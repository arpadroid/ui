import ArpaElement from '../../arpaElement/arpaElement.js';
import { appendNodes } from '@arpadroid/tools';
const html = String.raw;
class CircularPreloader extends ArpaElement {
    static template = html`
        {mask}
        <div class="circularPreloader__spinnerContainer">
            <span class="circularPreloader__spinner"></span>
            {text}
        </div>
    `;

    getDefaultConfig() {
        return {
            hasMask: false,
            variant: 'default',
            label: 'Loading...',
            text: '',
            template: CircularPreloader.template
        };
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

    async connectedCallback() {
        await super.connectedCallback();
        this.classList.add('circularPreloader');
        this.setAttribute('role', 'progressbar');
        this.setAttribute('aria-label', this.getProperty('label'));
        this.contentNode = this.querySelector('.circularPreloader__content');
        appendNodes(this, this._childNodes);
    }
}

customElements.define('circular-preloader', CircularPreloader);

export default CircularPreloader;
