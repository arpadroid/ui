/**
 * @typedef {import('./truncateText.types').TruncateTextConfigType } TruncateTextConfigType
 * @typedef {import('../buttons/button/button.js').default} ArpaButton
 * @typedef {import('../core/arpaZone/arpaZone.js').default} ArpaZone
 */
import ArpaElement from '../core/arpaElement/arpaElement.js';
import { classNames, defineCustomElement } from '@arpadroid/tools';

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

    ////////////////////////////
    // #region Rendering
    ////////////////////////////

    getTemplateVars() {
        return {
            ...super.getTemplateVars(),
            button: this.renderButton()
        };
    }

    async canRenderButton() {
        return this.getProp('hasButton') && this.canTruncate();
    }

    renderButton() {
        return html`<arpa-node
            name="button"
            tag="arpa-button"
            on-click="{toggleTruncate}"
            can-render="canRenderButton()"
            rhs-icon="{icon}"
            variant="minimal"
            button-class="${classNames(this.getProp('buttonClasses'))}"
        ></arpa-node>`;
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
        let content = (this._textContent || this.textContent || '').trim();
        if (!content) {
            content = this.contentNode?.textContent?.trim() || '';
        }
        return content.length > maxLength;
    }

    isTruncated() {
        return this.truncatedNode?.isConnected;
    }

    truncateText() {
        const maxLength = this.getMaxLength();
        const text = this.contentNode?.textContent?.trim();
        if (!maxLength || !text?.length || text?.length <= maxLength) {
            this.removeAttribute('is-truncated');
            return;
        }
        if (!this.truncatedNode) {
            this.truncatedNode = this.contentNode?.cloneNode();
        }
        const content = text?.slice(0, maxLength);

        if (this.truncatedNode instanceof HTMLElement) {
            this.truncatedNode.textContent = content;
            this.contentNode?.replaceWith(this.truncatedNode);
            this.ellipsisNode && this.truncatedNode?.after(this.ellipsisNode);
        }
        this.waitForArpaNodes().then(() => {
            this.button = /** @type {ArpaButton} */ (this.nodes.button);
            this.button?.setContent(this.getProp('lblShow'));
            this.button?.setProp('rhsIcon', this.getProp('icon'));
        });
    }

    showFullContent() {
        if (this.contentNode instanceof HTMLElement && this.truncatedNode instanceof HTMLElement) {
            this.truncatedNode?.replaceWith(this.contentNode);
        }
        this.ellipsisNode?.remove();
        this.button?.setProp('content', this.getProp('lblHide'));
        this.button?.setProp('rhsIcon', this.getProp('iconHide'));
        this.removeAttribute('is-truncated');
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

    getContentNode() {
        return this.querySelector('.truncateText__content');
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
        this._textContent = this.contentNode?.textContent?.trim() || '';
        this._childNodes = [...(this.contentNode?.childNodes || [])];
        this.reRender();
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        this.ellipsisNode = /** @type {HTMLElement} */ (this.nodes.ellipsis);
        this.ellipsisNode?.remove();
        return true;
    }

    async $onComplete() {
        if (!this.canTruncate()) {
            const button = this.querySelector('.truncateText__button');
            button?.remove();
        }

        if (this.hasProp('isTruncated')) {
            this.setAttribute('is-truncated', '');
        } else {
            this.removeAttribute('is-truncated');
        }
        return true;
    }

    /**
     * Called when a zone is inserted into the element.
     * @param {ArpaZone} zone
     * @returns {boolean}
     */
    $onZoneInserted(zone) {
        if (this._hasRendered) {
            if (this.contentNode instanceof HTMLElement) {
                this.contentNode.style.display = 'none';
                this.contentNode?.append(...zone.fragment.childNodes);
            }
            this.$onContentSet();
        }
        return false;
    }

    // #endregion LIFECYCLE
}

defineCustomElement('truncate-text', TruncateText);

export default TruncateText;
