import { attr, getSafeHtmlId, mergeObjects, render } from '@arpadroid/tools';

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
        this.handleVariant();
        this.classList.add(...this.getClassNames());
        this.render();
        if (typeof this._config.onClick === 'function') {
            this.addEventListener('click', this._config.onClick);
        }
    }

    handleVariant() {
        const variant = this.getVariant();
        if (variant === 'delete') {
            this.classList.add('deleteButton');
            const defaultConfig = {
                icon: 'delete',
                tooltipPosition: 'left',
                tooltip: 'delete'
            };
            this._config = mergeObjects(defaultConfig, this._config);
        }
    }

    getId() {
        return this.id || this._config.id || `iconButton-${getSafeHtmlId(this.getLabel())}`;
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
        const template = html`
            <arpa-icon>${this.getIcon()}</arpa-icon>
            ${this.renderTooltip()}
        `;

        this.innerHTML = template;
    }

    renderTooltip() {
        const label = this.getLabel();
        const id = this.getId();
        return render(
            label && id,
            html`
                <arpa-tooltip position="${this.getTooltipPosition()}" handler="#${id}">
                    ${label}
                </arpa-tooltip>
            `
        );
    }

    getTooltipPosition() {
        return this.getAttribute('tooltip-position') ?? this._config.tooltipPosition ?? 'left';
    }
}

customElements.define('icon-button', IconButton, { extends: 'button' });

export default IconButton;
