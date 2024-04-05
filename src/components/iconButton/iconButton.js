import { attr, getSafeHtmlId, mergeObjects } from '@arpadroid/tools';

const html = String.raw;
class IconButton extends HTMLButtonElement {
    static get observedAttributes() {
        return ['label', 'icon', 'variant'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'icon' && oldValue !== newValue) {
            this.render();
        }
    }

    constructor(config) {
        super();
        this.setConfig(config);
    }

    setConfig(config = {}) {
        this._config = mergeObjects(this.getDefaultConfig(), config);
    }

    getDefaultConfig() {
        return {};
    }

    connectedCallback() {
        attr(this, {
            id: this.getId(),
            'aria-label': this.getLabel(),
            type: 'button'
        });
        this.classList.add(...this.getClassNames());
        this.render();

        if (typeof this._config.onClick === 'function') {
            this.addEventListener('click', this._config.onClick);
        }
    }

    getId() {
        const id = this.getAttribute('id') ?? this._config.id;
        const label = this.getLabel();
        if (!id && label) {
            return `iconButton-${getSafeHtmlId(label)}`;
        }
    }

    getClassNames() {
        return ['iconButton'];
    }

    getVariant() {
        return this.getAttribute('variant') ?? this._config.variant;
    }

    getLabel() {
        return this.getAttribute('label') ?? this._config.label;
    }

    getIcon() {
        return this.getAttribute('icon') ?? this._config.icon ?? this.innerHTML;
    }

    render() {
        const label = this.getLabel();
        let template = html`<arpa-icon>${this.getIcon()}</arpa-icon>`;
        if (label && this.id) {
            template += html`
                <arpa-tooltip position="${this.getTooltipPosition()}" handler="#${this.id}">
                    ${label}
                </arpa-tooltip>
            `;
        }
        this.innerHTML = template;
    }

    getTooltipPosition() {
        return this.getAttribute('tooltip-position') ?? this._config.tooltipPosition ?? 'left';
    }
}
customElements.define('icon-button', IconButton, { extends: 'button' });
export default IconButton;
