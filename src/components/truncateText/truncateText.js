/**
 * @typedef {import('./truncateText.types').TruncateTextConfigType } TruncateTextConfigType
 * @typedef {import('../buttons/button/button.js').default} ArpaButton
 */
import ArpaElement from '../core/arpaElement/arpaElement.js';
import { defineCustomElement, listen } from '@arpadroid/tools';

const html = String.raw;
class TruncateText extends ArpaElement {
    /**
     * Returns the default component config.
     * @returns {TruncateTextConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.truncateText';
        /** @type {TruncateTextConfigType} */
        const config = {
            className: 'truncateText',
            maxLength: 50,
            ellipsis: '...',
            icon: 'visibility',
            iconHide: 'visibility_off',
            lblShow: '{i18n:lblReadMore}',
            lblHide: '{i18n:lblReadLess}',
            buttonClasses: [],
            hasButton: false,
            isTruncated: true
        };
        return super.getDefaultConfig(config);
    }

    async _initialize() {
        this.toggleTruncate = this.toggleTruncate.bind(this);
    }

    ////////////////////////////
    // #region Rendering
    ////////////////////////////

    getTemplateVars() {
        return {
            ...super.getTemplateVars(),
            button: this.renderButton()
        };
    }

    renderButton() {
        const buttonClasses = this.getProp('buttonClasses').join(' ');
        const canTruncate = this.canTruncate();
        return canTruncate
            ? html`<arpa-node
                  name="button"
                  tag="arpa-button"
                  can-render="hasButton"
                  rhs-icon="${this.getProp('icon')}"
                  variant="minimal"
                  button-class="${buttonClasses}"
              >
                  ${this.getProp('lblShow')}
              </arpa-node>`
            : '';
    }

    _getTemplate() {
        const isInline = this.hasProp('inlineLayout');
        return html`
            <arpa-node tag="span" name="wrapper">
                <arpa-node tag="span" name="content" is-content></arpa-node>
                <arpa-node tag="span" name="ellipsis" can-render="ellipsis"></arpa-node>
                ${isInline ? '{button}' : ''}
            </arpa-node>
            ${!isInline ? '{button}' : ''}
        `;
    }

    // #endregion Rendering

    ////////////////////////////
    // #region LIFECYCLE
    ////////////////////////////

    static get observedAttributes() {
        return ['is-truncated'];
    }

    /**
     * Handles attribute changes for the component.
     * @param {string} name
     * @param {string} oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'is-truncated') {
            newValue === null ? this.showFullContent() : this.truncateText();
        }
    }

    $onContentSet() {
        this._textContent = this.contentNode?.textContent;
        this.reRender();
    }

    async _initializeNodes() {
        await super._initializeNodes();
        this.buttonComponent = /** @type {ArpaButton} */ (this.templateNodes.button);
        this.buttonComponent?.promise.then(() => {
            this.button = this.buttonComponent?.button;
            this.button && listen(this.button, 'click', this.toggleTruncate);
        });
        this.ellipsisNode = /** @type {HTMLElement} */ (this.templateNodes.ellipsis);
        this.ellipsisNode.remove();
        this.contentNode = /** @type {HTMLElement} */ (this.templateNodes.content);
        this.wrapperNode = /** @type {HTMLElement} */ (this.templateNodes.wrapper);
        return true;
    }

    _onComplete() {
        if (this.hasProp('isTruncated')) {
            this.setAttribute('is-truncated', '');
            this.truncateText();
        }
    }

    // #endregion LIFECYCLE

    //////////////////////////////
    // #region Truncation
    /////////////////////////////

    getMaxLength() {
        return parseFloat(this.getProp('maxLength'));
    }

    canTruncate() {
        const maxLength = this.getMaxLength();
        const content = (this._textContent || this.textContent || '').trim();
        return content.length > maxLength;
    }

    isTruncated() {
        return this.truncatedNode?.isConnected;
    }

    async truncateText() {
        const maxLength = this.getMaxLength();
        const text = this.contentNode?.textContent?.trim();
        if (!maxLength || !text?.length || text?.length <= maxLength) return;
        if (!this.truncatedNode) {
            this.truncatedNode = this.contentNode?.cloneNode();
        }
        const content = text?.slice(0, maxLength);
        this.truncatedNode.textContent = content;
        this.contentNode?.replaceWith(this.truncatedNode);
        this.ellipsisNode && this.truncatedNode?.after(this.ellipsisNode);
        this.buttonComponent?.setContent(this.getProp('lblShow'));
        this.buttonComponent?.setIconRight(this.getProp('icon'));
    }

    showFullContent() {
        this.truncatedNode?.replaceWith(this.contentNode);
        this.ellipsisNode?.remove();
        this.buttonComponent?.setContent(this.getProp('lblHide'));
        this.buttonComponent?.setIconRight(this.getProp('iconHide'));
    }

    toggleTruncate() {
        this.isTruncated() ? this.removeAttribute('is-truncated') : this.setAttribute('is-truncated', '');
    }

    // #endregion Truncation
}

defineCustomElement('truncate-text', TruncateText);

export default TruncateText;
