import ArpaElement from '../../arpaElement/arpaElement.js';
const html = String.raw;
class CircularPreloader extends ArpaElement {
    static template = html`
        {mask}
        <div class="circularPreloader__spinnerContainer">
            <span class="circularPreloader__spinner"></span>
            {text}
        </div>
    `;

    async connectedCallback() {
        await super.connectedCallback();
        this.classList.add('circularPreloader');
        this.setAttribute('role', 'progressbar');
        this.contentNode = this.querySelector('.circularPreloader__content');
        this.contentNode?.append(...this._childNodes);
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
        const text = this.getProperty('text') || '';
        const hasContent = text || this._childNodes?.length;
        return {
            text: hasContent && html`<div class="circularPreloader__content">${text}</div>`,
            mask: this.hasMask() && html`<div class="circularPreloader__mask"></div>`
        };
    }

    hasMask() {
        return Boolean(this.hasAttribute('has-mask') || this._config.hasMask);
    }
}

customElements.define('circular-preloader', CircularPreloader);

export default CircularPreloader;
