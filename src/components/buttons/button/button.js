/**
 * @typedef {import('./button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('../../tooltip/tooltip').default} Tooltip
 * @typedef {import('../../icon/icon').default} Icon
 */
import { renderNode, listen, $attr, classNames, defineCustomElement } from '@arpadroid/tools';
import { renderChild } from '../../core/arpaElement/helper/arpaElementTemplate.helper';
import ArpaElement from '../../core/arpaElement/arpaElement';

const html = String.raw;
class Button extends ArpaElement {
    /** @type {ButtonConfigType} */
    _config = this._config;

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
            tooltipPosition: 'left',
            variant: 'default'
        };
        return /** @type {ButtonConfigType} */ (super.getDefaultConfig(config));
    }

    /////////////////////////
    // #region Get
    /////////////////////////

    /**
     * Returns the variant of the button.
     * @returns {string}
     */
    getVariant() {
        return this.variant || this.getProp('variant');
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
        const node = this.editNode('icon', { content: icon });
        node && !node?.isConnected && this.button?.prepend(node);
    }

    /**
     * Sets the icon to display.
     * @param {string} icon - The string defining the icon to display.
     */
    setIconRight(icon) {
        const node = this.editNode('rhsIcon', { content: icon });
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
            renderNode(renderChild(this, 'tooltip', { content: stringContent, canRender: () => true }))
        );
    }

    /**
     * Sets the label to display in the tooltip.
     * @param {string | HTMLCollection | NodeList} content
     */
    async setTooltip(content) {
        await this.promise;
        this.tooltip = /** @type {Tooltip | null} */ (this.templateNodes.tooltip || this.createTooltip(''));
        if (this.tooltip && !this.tooltip?.isConnected) {
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

    $renderTemplate() {
        return html`<button
            ${$attr({
                ariaLabel: this.getAriaLabel(),
                class: classNames(this.getProp('buttonClass'), this.variant === 'delete' && 'button--delete'),
                type: this.getProp('type'),
                variant: this.variant,
                disabled: this.disabled,
                zone: this.getProp('buttonZone')
            })}
        >
            <arpa-node tag="arpa-icon" name="icon"></arpa-node>
            <arpa-node tag="span" is-content name="content">{label}</arpa-node>
            <arpa-node tag="arpa-icon" name="rhsIcon"></arpa-node>

            <arpa-node
                tag="arpa-tooltip"
                name="tooltip"
                zone-target=".tooltip__content"
                position="{tooltipPosition}"
            ></arpa-node>
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

    async $initializeNodes() {
        await super.$initializeNodes();
        this.tooltip = /** @type {Tooltip | null} */ (this.querySelector('arpa-tooltip'));
        this.tooltip && (await this.tooltip.promise);

        /** @type {Icon | null} */
        this.icon = this.querySelector('.arpaButton__icon');
        this.contentNode = this.querySelector('.arpaButton__content');

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

    handleVariant() {
        const variant = this.getVariant();
        const icon = this.icon?.getIcon();
        if (!icon) {
            if (['delete', 'delete-outlined'].includes(variant)) {
                this.setProp('icon', 'delete');
            } else if (['submit', 'submit-outlined'].includes(variant)) {
                this.setProp('icon', 'check_circle');
                this.button?.setAttribute('type', 'submit');
            }
        }
    }

    // #endregion Lifecycle
}

defineCustomElement('arpa-button', Button);

export default Button;
