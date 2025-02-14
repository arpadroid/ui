/**
 * @typedef {import('../tooltip/tooltip').default} Tooltip
 * @typedef {import('./iconButton.types').IconButtonConfigType} IconButtonConfigType
 */
import { attr, attrString, getSafeHtmlId, mergeObjects, handleZones, renderNode } from '@arpadroid/tools';
import { zoneMixin, getProperty, hasProperty, hasZone } from '@arpadroid/tools';
const html = String.raw;

class IconButton extends HTMLButtonElement {
    /**
     * Creates an instance of IconButton.
     * @param {IconButtonConfigType} config - Configuration object.
     */
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
            'aria-label': this.getLabel().toString(),
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

    /**
     * Handles a lost zone.
     * @param {import('@arpadroid/tools').ZoneToolPlaceZoneType} event - The event object.
     */
    _onLostZone({ zoneName, zone }) {
        zone && zoneName === 'tooltip-content' && this.setLabel(zone.innerHTML);
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
        !this.id && (this.id = `iconButton-${getSafeHtmlId(this.getLabel().toString())}`);
        return this.id;
    }

    hasTooltip() {
        const tooltipParent = this.closest('arpa-tooltip');
        return !tooltipParent && (hasProperty(this, 'label') || hasZone(this, 'tooltip-content'));
    }

    getClassNames() {
        return ['iconButton'];
    }

    getVariant() {
        return getProperty(this, 'variant');
    }

    getLabel() {
        return getProperty(this, 'label') || getProperty(this, 'aria-label') || '';
    }

    getIcon() {
        return this.getAttribute('icon') ?? this._config.icon ?? this.innerHTML;
    }

    async render() {
        const icon = this.getIcon();
        const iconHTML = icon ? html`<arpa-icon>${icon}</arpa-icon>` : '';
        this.innerHTML = html`${iconHTML}${this.renderTooltip()}`;
        /** @type {Tooltip | null} */
        this.tooltip = this.querySelector('arpa-tooltip');
        handleZones();
    }

    /**
     * Sets the icon to display.
     * @param {string} icon - The string defining the icon to display.
     */
    setIcon(icon) {
        const iconNode = this.querySelector('arpa-icon');
        iconNode && (iconNode.innerHTML = icon);
    }

    /**
     * Sets the label to display in the tooltip.
     * @param {string} label
     */
    setLabel(label) {
        if (this.tooltip) {
            this.tooltip?.setContent(label);
        } else {
            this.tooltip = renderNode(this.renderTooltip());
            this.tooltip && this.appendChild(this.tooltip);
        }
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
