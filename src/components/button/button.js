/**
 * @typedef {import('./button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('../tooltip/tooltip').default} Tooltip
 */
import { renderNode, mergeObjects, listen } from '@arpadroid/tools';
import { appendNodes, attrString, defineCustomElement } from '@arpadroid/tools';
import { renderChild } from '../arpaElement/helper/renderer.helper.js';
import ArpaElement from '../arpaElement/arpaElement';

const html = String.raw;
class Button extends ArpaElement {
    /**
     * Returns the default configuration for the button.
     * @returns {ButtonConfigType}
     */
    getDefaultConfig() {
        this.bind('_onClick');
        /** @type {ButtonConfigType} */
        const config = {
            className: 'arpaButton',
            type: 'button',
            buttonClass: 'arpaButton__button',
            templateChildren: {
                content: { tag: 'span', zoneName: 'buttonContent', canRender: true },
                icon: { tag: 'arpa-icon' },
                rhsIcon: { tag: 'arpa-icon' },
                tooltip: { tag: 'arpa-tooltip', attr: { position: this.getTooltipPosition.bind(this) } }
            }
        };
        return /** @type {ButtonConfigType} */ (super.getDefaultConfig(config));
    }

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
        return this.renderButton();
    }

    renderButton() {
        const attr = attrString({
            ariaLabel: this.getAriaLabel(),
            class: this.getProperty('button-class'),
            type: this.getProperty('type'),
            variant: this.variant,
            disabled: this.disabled
        });
        return html`<button ${attr}>{icon}{content}{rhsIcon}{tooltip}</button>`;
    }

    // #endregion Render

    /////////////////////////
    // #region Get
    /////////////////////////

    getLabel() {
        return this.getProperty('label') || '';
    }

    getVariant() {
        return this.variant || this.getProperty('variant');
    }

    getTooltipPosition() {
        return this.getProperty('tooltip-position') || 'left';
    }

    getAriaLabel() {
        return (
            this.getProperty('aria-label') ||
            this.getProperty('label-text') ||
            this.getProperty('tooltip') ||
            this.getLabel() ||
            ''
        );
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
        const node = this.editChild('icon', { content: icon });
        node && !node?.isConnected && this.button?.prepend(node);
    }

    /**
     * Sets the icon to display.
     * @param {string} icon - The string defining the icon to display.
     */
    setIconRight(icon) {
        const node = this.editChild('rhsIcon', { content: icon });
        node && !node?.isConnected && this.button?.append(node);
    }

    /**
     * Sets the content of the element.
     * @param {string | HTMLElement} content - The content to set.
     * @param {HTMLElement | null} [contentContainer] - The container for the content.
     */
    setContent(content, contentContainer = this.querySelector('.arpaButton__content')) {
        super.setContent(content, contentContainer);
    }

    /**
     * Sets the label to display in the tooltip.
     * @param {string} label
     */
    async setTooltip(label) {
        let tooltip = /** @type {Tooltip | undefined} */ (this.templateNodes.tooltip);
        if (!tooltip) {
            tooltip = /** @type {Tooltip} */ (renderNode(renderChild(this, 'tooltip', { content: label })));
            tooltip instanceof HTMLElement && this.button?.appendChild(tooltip);
        }
        tooltip?.setContent(label);
        this.tooltip && (this.tooltip = tooltip);
    }

    // #endregion Set

    /////////////////////////
    // #region Lifecycle
    //////////////////

    _onClick() {
        const { onClick } = this._config;
        typeof onClick === 'function' && onClick(this);
    }

    async _initializeNodes() {
        await super._initializeNodes();

        this.tooltip = /** @type {Tooltip | null} */ (this.querySelector('arpa-tooltip'));
        this.icon = this.querySelector('.arpaButton__icon');
        this.contentNode = this.querySelector('.arpaButton__content');

        const contentNodes = this.getContentNodes();
        this.contentNode && appendNodes(this.contentNode, contentNodes);
        this._initializeButton();
        return true;
    }

    _initializeButton() {
        const button = this.querySelector('button');
        if (!button) return;
        this.variant === 'delete' && button.classList.add('button--delete');
        listen(button, 'click', this._onClick);
        /** @type {HTMLButtonElement | null} */
        this.button = button;
    }

    getContentNodes() {
        return this._childNodes;
    }

    handleVariant() {
        if (this.getProperty('variant') === 'delete') {
            this._config = mergeObjects(this._config, {
                icon: 'delete',
                tooltipPosition: 'left',
                tooltip: 'delete'
            });
        }
    }

    /**
     * Handles a lost zone.
     * @param {import('../../tools/zoneTool.types.js').ZoneToolPlaceZoneType} event - The event object.
     * @returns {boolean | undefined} Whether the zone was handled.
     */
    _onLostZone({ zoneName, zone }) {
        if (!zone || !zoneName) return;
        if (['tooltip', 'tooltip-content'].includes(zoneName)) {
            this.setTooltip(zone.innerHTML);
            return true;
        }
    }

    // #endregion Lifecycle
}

defineCustomElement('arpa-button', Button);

export default Button;
