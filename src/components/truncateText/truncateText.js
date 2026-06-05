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
        this._observeContents();
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
        const buttonClasses = this.getProperty('buttonClasses').join(' ');
        const canTruncate = this.canTruncate();
        return canTruncate
            ? html`<arpa-node
                  name="button"
                  tag="arpa-button"
                  can-render="hasButton"
                  rhs-icon="${this.getProperty('icon')}"
                  variant="minimal"
                  button-class="${buttonClasses}"
              >
                  ${this.getProperty('lblShow')}
              </arpa-node>`
            : '';
    }

    _getTemplate() {
        const hasInlineLayout = this.hasProperty('inlineLayout');
        return html`
            <arpa-node tag="span" name="wrapper">
                <arpa-node tag="span" name="content" is-content></arpa-node>
                <arpa-node tag="span" name="ellipsis" can-render="ellipsis"></arpa-node>
                ${hasInlineLayout ? '{button}' : ''}
            </arpa-node>
            ${!hasInlineLayout ? '{button}' : ''}
        `;
    }

    // #endregion Rendering

    ////////////////////////////
    // #region LIFECYCLE
    ////////////////////////////

    _observeContents() {
        const observer = new MutationObserver(async () => {
            await this.promise;
            const textNode = this.querySelector('.truncateText__content');

            if (!this.canTruncate()) {
                this.button?.isConnected && this.button.remove();
                this.ellipsisNode?.isConnected && this.ellipsisNode.remove();
            }
            const content = textNode?.textContent?.trim() || '';
            const contentHasChanged = content?.trim() !== this._textContent?.trim();
            if (contentHasChanged) {
                this._childNodes = [...this.childNodes];
                this._content = this.innerHTML;
                this._textContent = this.textContent?.trim();
                this.reRender();
            }
        });
        observer.observe(this, { childList: true });
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

    static get observedAttributes() {
        return ['is-truncated'];
    }

    async _initializeNodes() {
        await super._initializeNodes();
        this.button = /** @type {ArpaButton} */ (this.templateNodes.button);
        this.ellipsisNode = /** @type {HTMLElement} */ (this.templateNodes.ellipsis);
        this.ellipsisNode.remove();
        this.button && listen(this.button, 'click', this.toggleTruncate);
        this.contentNode = /** @type {HTMLElement} */ (this.templateNodes.content);
        this.wrapperNode = /** @type {HTMLElement} */ (this.templateNodes.wrapper);
        return true;
    }

    _onComplete() {
        if (this.hasProperty('isTruncated')) {
            this.setAttribute('is-truncated', '');
            this.truncateText();
        }
    }

    // #endregion LIFECYCLE

    //////////////////////////////
    // #region Truncation
    /////////////////////////////

    canTruncate() {
        const maxLength = parseFloat(this.getProperty('maxLength'));
        const content = (this._textContent || this.textContent || '').trim();
        return content.length > maxLength;
    }

    isTruncated() {
        return this.truncatedNode?.isConnected;
    }

    async truncateText() {
        const maxLength = parseFloat(this.getProperty('maxLength'));
        this.originalText = this.contentNode?.textContent?.trim();
        if (!maxLength || !this.originalText?.length || this.originalText?.length <= maxLength) return;
        const text = this.contentNode?.textContent?.trim();
        if (!this.truncatedNode) {
            this.truncatedNode = this.contentNode?.cloneNode();
        }
        const content = text?.slice(0, maxLength);
        this.truncatedNode.textContent = content;
        this.contentNode?.replaceWith(this.truncatedNode);
        this.ellipsisNode && this.truncatedNode?.after(this.ellipsisNode);
        if (this.button) {
            this.button.setContent(this.getProperty('lblShow'));
            this.button.setIconRight(this.getProperty('icon'));
        }
    }

    showFullContent() {
        this.truncatedNode?.replaceWith(this.contentNode);
        this.ellipsisNode?.remove();
        if (this.button) {
            this.button.setContent(this.getProperty('lblHide'));
            this.button.setIconRight(this.getProperty('iconHide'));
        }
    }

    toggleTruncate() {
        this.isTruncated() ? this.removeAttribute('is-truncated') : this.setAttribute('is-truncated', '');
    }

    // #endregion Truncation
}

defineCustomElement('truncate-text', TruncateText);

export default TruncateText;
