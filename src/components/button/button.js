/**
 * @typedef {import('./button.types').ButtonConfigType} ButtonConfigType
 */
import { renderNode, mergeObjects } from '@arpadroid/tools';
import { appendNodes, attrString, classNames, defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement';

const html = String.raw;
class Button extends ArpaElement {
    _preInitialize() {
        this.bind('_onClick');
        super._preInitialize();
    }

    /**
     * Returns the default configuration for the button.
     * @returns {ButtonConfigType}
     */
    getDefaultConfig() {
        return {
            type: 'button',
            buttonClass: 'arpaButton'
        };
    }

    /////////////////////////
    // #region Get
    /////////////////////////

    getLabel() {
        return this.getProperty('label') || '';
    }

    getAriaLabel() {
        return this.getProperty('aria-label');
    }

    getIcon() {
        return this.getProperty('icon');
    }

    getVariant() {
        return this.variant || this.getProperty('variant');
    }

    getTooltip() {
        return this.getProperty('tooltip') || this.getLabel();
    }

    // #endregion Get

    /////////////////////////
    // #region Set
    /////////////////////////

    /**
     * Sets the icon to display.
     * @param {string} icon - The string defining the icon to display.
     */
    setIcon(icon) {
        if (typeof icon !== 'string') return;
        this._config.icon = icon;
        this.setAttribute('icon', icon);
        const iconNode = this.icon || this.querySelector('arpa-icon');

        if (iconNode) {
            iconNode.innerHTML = icon;
        } else {
            this.icon = renderNode(this.renderIcon());
            this.button?.appendChild(this.icon);
        }
    }

    /**
     * Sets the label to display in the tooltip.
     * @param {string} label
     */
    setTooltip(label) {
        if (this.tooltip) {
            this.tooltip?.setContent(label);
        } else {
            this.tooltip = renderNode(this.renderTooltip(label));
            this.tooltip && this.appendChild(this.tooltip);
        }
    }

    // #endregion Set

    /////////////////////////
    // #region Render
    /////////////////////////

    _preRender() {
        super._preRender();
        this.variant = this.getProperty('variant');
        this.handleVariant();
        this.disabled = this.hasAttribute('disabled');
        this.removeAttribute('disabled');
        this.removeAttribute('variant');
    }

    _getTemplate() {
        return html`<button
            ${attrString({
                ariaLabel: this.getProperty('label-text'),
                class: this.getProperty('button-class'),
                type: this.getProperty('type'),
                variant: this.variant,
                disabled: this.disabled
            })}
        >
            {icon}{content}{iconRight}{tooltip}
        </button>`;
    }

    getTemplateVars() {
        return {
            icon: this.renderIcon('icon', 'button__lhsIcon'),
            content: this.renderContent(),
            iconRight: this.renderIcon('icon-right', 'button__rhsIcon'),
            tooltip: this.renderTooltip()
        };
    }

    renderContent() {
        const content = this.getProperty('content') || '';
        return html`<span class="button__content">${content}</span>`;
    }

    renderIcon(iconProp = 'icon', className = '') {
        return this.renderChild(iconProp, {
            className: classNames('button__icon', className),
            tag: 'arpa-icon',
            content: this.getProperty(iconProp)
        });
    }

    getTooltipPosition() {
        return this.getProperty('tooltip-position') || 'left';
    }

    hasTooltip() {
        const tooltipParent = this.closest('arpa-tooltip');
        const tooltipValue = this.getTooltip();
        return !tooltipParent && (tooltipValue || this.hasZone('tooltip-content'));
    }

    renderTooltip(tooltip = this.getTooltip()) {
        if (!this.hasTooltip()) return '';
        const attr = attrString({ position: this.getTooltipPosition() });
        return html`<arpa-tooltip ${attr}>${tooltip}</arpa-tooltip>`;
    }

    // #endregion Render

    /////////////////////////
    // #region Lifecycle
    //////////////////

    _onClick() {
        const { onClick } = this._config;
        if (typeof onClick === 'function') {
            onClick(this);
        }
    }

    async _initializeNodes() {
        await super._initializeNodes();

        this.button = this.querySelector('button');
        if (this.variant === 'delete') {
            this.button?.classList.add('button--delete');
        }

        this.button?.removeEventListener('click', this._onClick);
        this.button?.addEventListener('click', this._onClick);

        this.tooltip = this.querySelector('arpa-tooltip');
        this.icon = this.querySelector('.button__icon');

        this.contentNode = this.querySelector('.button__content');
        this.contentNode && appendNodes(this.contentNode, this._childNodes);
        this._initializeAriaLabel();
        return true;
    }

    async _initializeAriaLabel() {
        this.ariaLabel = this.getProperty('aria-label');
        if (this.ariaLabel && this.button) {
            this.button?.setAttribute('aria-label', this.ariaLabel);
            this.removeAttribute('aria-label');
        }
        await this.tooltip?.promise;
        await new Promise(resolve => setTimeout(resolve, 0));
        const buttonText = this.contentNode?.textContent?.trim();
        const tooltipText = this.tooltip?.contentNode?.textContent.trim();
        const label = /** @type {string} */ (this.ariaLabel || this.getTooltip() || tooltipText);
        if (!this.button?.hasAttribute('aria-label') && !buttonText && label) {
            this.button?.setAttribute('aria-label', label);
        }
    }

    handleVariant() {
        const variant = this.getVariant();
        if (variant === 'delete') {
            const defaultConfig = {
                icon: 'delete',
                tooltipPosition: 'left',
                tooltip: 'delete'
            };
            this._config = mergeObjects(defaultConfig, this._config);
        }
    }

    /**
     * Handles a lost zone.
     * @param {import('@arpadroid/tools').ZoneToolPlaceZoneType} event - The event object.
     * @returns {boolean | undefined} Whether the zone was handled.
     */
    _onLostZone({ zoneName, zone }) {
        if (zone && zoneName === 'tooltip-content') {
            this.setTooltip(zone.innerHTML);
            return true;
        }
    }

    // #endregion Lifecycle
}

defineCustomElement('arpa-button', Button);

export default Button;
