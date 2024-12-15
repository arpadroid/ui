import { attr, attrString, getSafeHtmlId, mergeObjects, handleZones } from '@arpadroid/tools';
import { zoneMixin, hasZone, CustomElementTool } from '@arpadroid/tools';
const { getProperty, hasProperty } = CustomElementTool;
const html = String.raw;

class IconButton extends HTMLButtonElement {
    constructor(config) {
        super();
        zoneMixin(this);
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
            'aria-label': this.getLabel(),
            type: 'button'
        });
        this.handleVariant();
        this.classList.add(...this.getClassNames());
        this.render();
        if (typeof this._config.onClick === 'function') {
            this.removeEventListener('click', this._config.onClick);
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
        if (this.id) return this.id;
        this._config.id && (this.id = this._config.id);
        !this.id && (this.id = `iconButton-${getSafeHtmlId(this.getLabel())}`);
        return this.id;
    }

    hasTooltip() {
        return hasProperty(this, 'label') || hasZone(this, 'tooltip-content');
    }

    getClassNames() {
        return ['iconButton'];
    }

    getVariant() {
        return getProperty(this, 'variant');
    }

    getLabel() {
        return getProperty(this, 'label') || '';
    }

    getIcon() {
        return this.getAttribute('icon') ?? this._config.icon ?? this.innerHTML;
    }

    async render() {
        const icon = this.getIcon();
        const template = html`
            ${icon ? html`<arpa-icon>${this.getIcon()}</arpa-icon>` : ''} ${this.renderTooltip()}
        `;
        this.innerHTML = template;
        handleZones();
    }

    setIcon(icon) {
        const iconNode = this.querySelector('arpa-icon');
        iconNode && (iconNode.innerHTML = icon);
    }

    renderTooltip() {
        if (!this.hasTooltip()) return '';
        const id = this.getId();
        const attr = attrString({ position: this.getTooltipPosition(), handler: id && `#${id}` });
        return html`<arpa-tooltip ${attr}>
            <zone name="tooltip-content">${this.getLabel()}</zone>
        </arpa-tooltip>`;
    }

    getTooltipPosition() {
        return this.getAttribute('tooltip-position') ?? this._config.tooltipPosition ?? 'left';
    }
}

customElements.define('icon-button', IconButton, { extends: 'button' });

export default IconButton;
