/**
 * @typedef {import('./button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('../tooltip/tooltip').default} Tooltip
 * @typedef {import('../icon/icon').default} Icon
 */
import { renderNode, listen } from '@arpadroid/tools';
import { appendNodes, attrString, defineCustomElement } from '@arpadroid/tools';
import { renderChild } from '../arpaElement/helper/arpaElement.helper';
import ArpaElement from '../arpaElement/arpaElement';

const html = String.raw;
class Button extends ArpaElement {
    /** @type {ButtonConfigType} */
    _config = this._config;

    /**
     * Returns the default configuration for the button.
     * @returns {ButtonConfigType}
     */
    getDefaultConfig() {
        this.bind('_onClick', 'getTooltipPosition');
        /** @type {ButtonConfigType} */
        const config = {
            className: 'arpaButton',
            type: 'button',
            buttonClass: 'arpaButton__button',
            variant: 'default',
            templateChildren: {
                content: {
                    tag: 'span',
                    canRender: true,
                    content: '{label}'
                },
                icon: { tag: 'arpa-icon' },
                rhsIcon: { tag: 'arpa-icon' },
                tooltip: {
                    tag: 'arpa-tooltip',
                    attr: {
                        position: this.getTooltipPosition
                    }
                }
            }
        };
        return /** @type {ButtonConfigType} */ (super.getDefaultConfig(config));
    }

    /////////////////////////
    // #region Get
    /////////////////////////

    getLabel() {
        return this.getProperty('label') || '';
    }

    /**
     * Returns the variant of the button.
     * @returns {string}
     */
    getVariant() {
        return this.variant || this.getProperty('variant');
    }

    getTooltipPosition() {
        return this.getProperty('tooltip-position') || 'left';
    }

    /**
     * Returns the aria-label for the button, prioritizing the ariaLabel property, then label, then tooltip content.
     * @returns {string} The resolved aria-label for the button.
     */
    getAriaLabel() {
        const { ariaLabel, label, tooltip } = this.getProperties('ariaLabel', 'label', 'tooltip');
        const aria = ariaLabel || label || tooltip || '';
        return this.resolveAriaLabel(aria) || '';
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
     * Creates a tooltip element with the specified content.
     * @param {string | HTMLCollection | NodeList} content
     * @returns {Tooltip}
     */
    createTooltip(content) {
        const stringContent = typeof content === 'string' ? content : '';
        return /** @type {Tooltip} */ (
            renderNode(renderChild(this, 'tooltip', { content: stringContent, canRender: true }))
        );
    }

    /**
     * Sets the label to display in the tooltip.
     * @param {string | HTMLCollection | NodeList} content
     */
    async setTooltip(content) {
        await this.promise;
        this.tooltip = /** @type {Tooltip} */ (this.templateNodes.tooltip || this.createTooltip(content));
        if (!this.tooltip?.isConnected) {
            this.button?.appendChild(this.tooltip);
        }
        this.tooltip?.setContent(content);
    }

    // #endregion Set

    /////////////////////////
    // #region Render
    /////////////////////////
    _preRender() {
        super._preRender();
        this.variant = this.getVariant();
        this.disabled = this.hasAttribute('disabled') || this.variant === 'disabled';
        this.removeAttribute('disabled');
        this.removeAttribute('variant');
    }

    getTemplateVars() {
        return {
            ...super.getTemplateVars(),
            label: this.getLabel()
        };
    }

    _getTemplate() {
        return html`<button
            ${attrString({
                ariaLabel: this.getAriaLabel(),
                class: this.getProperty('button-class'),
                type: this.getProperty('type'),
                variant: this.variant,
                disabled: this.disabled,
                zone: this.getProperty('button-zone')
            })}
        >
            {icon}{content}{rhsIcon}{tooltip}
        </button>`;
    }

    // #endregion Render

    /////////////////////////
    // #region Lifecycle
    //////////////////

    _onClick() {
        const { '@onClick': onClick } = this._config;
        if (typeof onClick === 'function') {
            onClick(this);
        }
    }

    async _initializeNodes() {
        await super._initializeNodes();

        this.tooltip = /** @type {Tooltip | null} */ (this.querySelector('arpa-tooltip'));
        /** @type {Icon | null} */
        this.icon = this.querySelector('.arpaButton__icon');
        this.contentNode = this.querySelector('.arpaButton__content');

        const contentNodes = this.getContentNodes();
        this.contentNode && appendNodes(this.contentNode, contentNodes);
        this._initializeButton();
        this.handleVariant();
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
        const variant = this.getVariant();
        const icon = this.icon?.getIcon();
        if (!icon) {
            if (['delete', 'delete-outlined'].includes(variant)) {
                this.setIcon('delete');
            } else if (['submit', 'submit-outlined'].includes(variant)) {
                this.setIcon('check_circle');
                this.button?.setAttribute('type', 'submit');
            }
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
            this.setTooltip(zone.childNodes);
            return true;
        }
    }

    // #endregion Lifecycle
}

defineCustomElement('arpa-button', Button);

export default Button;
