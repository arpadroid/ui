/**
 * @typedef {import('./truncateText.types').TruncateTextConfigType } TruncateTextConfigType
 * @typedef {import('../buttons/button/button.js').default} ArpaButton
 */
import ArpaElement from '../core/arpaElement/arpaElement.js';
import { classNames, defineCustomElement, listen } from '@arpadroid/tools';

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

    async $initialize() {
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
        return html`<arpa-node
            name="button"
            tag="arpa-button"
            can-render="hasButton && canTruncate()"
            rhs-icon="{icon}"
            variant="minimal"
            button-class="${classNames(this.getProp('buttonClasses'))}"
        >
            {lblShow}
        </arpa-node>`;
    }

    $renderTemplate() {
        const isInline = this.hasProp('inlineLayout');
        return html`
            <arpa-node tag="span" name="wrapper">
                <arpa-node tag="span" name="content" is-content></arpa-node>
                <arpa-node tag="span" name="ellipsis" can-render="ellipsis"></arpa-node>
                ${isInline ? this.renderButton() : ''}
            </arpa-node>
            ${!isInline ? this.renderButton() : ''}
        `;
    }

    // #endregion Rendering

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
        this.buttonComponent?.setProp('content', this.getProp('lblShow'));
        this.buttonComponent?.setProp('rhsIcon', this.getProp('icon'));
    }

    showFullContent() {
        this.truncatedNode?.replaceWith(this.contentNode);
        this.ellipsisNode?.remove();
        this.buttonComponent?.setProp('content', this.getProp('lblHide'));
        this.buttonComponent?.setProp('rhsIcon', this.getProp('iconHide'));
    }

    toggleTruncate() {
        this.isTruncated() ? this.removeAttribute('is-truncated') : this.setAttribute('is-truncated', '');
    }

    // #endregion Truncation

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

    async $initializeNodes() {
        await super.$initializeNodes();
        this.buttonComponent = /** @type {ArpaButton} */ (this.nodes.button);
        this.buttonComponent?.promise.then(() => {
            this.button = this.buttonComponent?.button;
            this.button && listen(this.button, 'click', this.toggleTruncate);
        });
        this.ellipsisNode = /** @type {HTMLElement} */ (this.nodes.ellipsis);
        this.ellipsisNode.remove();
        return true;
    }

    $onComplete() {
        if (!this.canTruncate()) {
            const button = this.querySelector('.truncateText__button');
            button?.remove();
        }
        if (this.hasProp('isTruncated')) {
            this.setAttribute('is-truncated', '');
            this.truncateText();
        } else {
            this.showFullContent();
        }
    }

    // #endregion LIFECYCLE
}

defineCustomElement('truncate-text', TruncateText);

export default TruncateText;
