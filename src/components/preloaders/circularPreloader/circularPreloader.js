import ArpaElement from '../../arpaElement/arpaElement.js';
import { attr } from '@arpadroid/tools';
const html = String.raw;
class CircularPreloader extends ArpaElement {
    static template = html`
        {mask}
        <div class="circularPreloader__spinnerContainer">
            <span class="circularPreloader__spinner"></span>
            {text}
        </div>
    `;

    connectedCallback() {
        this.classList.add('circularPreloader', `circularPreloader--${this.getVariant()}`);
        attr(this, {
            role: 'progressbar'
        });
    }

    getDefaultConfig() {
        return {
            hasMask: true,
            variant: 'default',
            text: '',
            template: CircularPreloader.template
        };
    }

    getTemplateVars() {
        const text = this.getProperty('text');
        return {
            text: text && html`<div class="circularPreloader__text">${text}</div>`,
            mask: this.hasMask() && html`<div class="circularPreloader__mask"></div>`
        };
    }

    hasMask() {
        return Boolean(this.hasAttribute('has-mask') || this._config.hasMask);
    }
}

customElements.define('circular-preloader', CircularPreloader);

export default CircularPreloader;
