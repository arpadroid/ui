/**
 * @typedef {import('./truncateText.types').TruncateTextConfigType } TruncateTextConfigType
 * @typedef {import('../buttons/button/button.js').default} ArpaButton
 * @typedef {import('../buttons/iconButton/iconButton.js').default} IconButton
 * @typedef {import('../core/arpaZone/arpaZone.js').default} ArpaZone
 */
import ArpaElement from '../core/arpaElement/arpaElement.js';
import { $attr, classNames, defineCustomElement } from '@arpadroid/tools';

const html = String.raw;
class TruncateText extends ArpaElement {
    /**
     * Returns the default component config.
     * @returns {TruncateTextConfigType}
     */
    getDefaultConfig() {
        if (this.hasAttribute('max-lines')) {
            this.setAttribute('is-clamped', '');
        }
        this.i18nKey = 'ui.truncateText';
        /** @type {TruncateTextConfigType} */
        const config = {
            className: 'truncateText',
            maxLength: 50,
            ellipsis: '...',
            icon: 'visibility',
            iconHide: 'visibility_off',
            lblShow: this.i18nText('lblReadMore'),
            lblHide: this.i18nText('lblReadLess'),
            buttonClasses: [],
            hasButton: true,
            isTruncated: true,
            reuseExistingNodes: false,
            inlineLayout: false
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

    canRenderButton() {
        return !this.hasProp('maxLines') && this.getProp('hasButton') && this.canTruncate();
    }

    renderButton() {
        return html`<arpa-node
            ${$attr({ readOnly: Boolean(this.closest('button')) })}
            name="button"
            tag="arpa-button"
            on-click="{toggleTruncate}"
            can-render="canRenderButton()"
            rhs-icon="{icon}"
            variant="minimal"
            button-class="${classNames(this.getProp('buttonClasses'))}"
        >
            ${this.getProp('lblShow')}
        </arpa-node>`;
    }

    renderMiniButton() {
        return html`<arpa-zone name="content" append-content>
            <arpa-node
                name="miniButton"
                tag="icon-button"
                on-click="{toggleTruncate}"
                tooltip="${this.i18nText('lblReadMore')}"
                icon="{icon}"
                variant="mini"
            >
            </arpa-node>
        </arpa-zone>`;
    }

    $renderTemplate() {
        const isInline = this.hasProp('inlineLayout');
        return html`
            <arpa-node tag="span" name="wrapper">
                <arpa-node tag="span" name="content" is-content> </arpa-node>
                <arpa-node tag="span" name="ellipsis" can-render="ellipsis"></arpa-node>
                ${this.getMaxLines() ? this.renderMiniButton() : ''} ${isInline ? this.renderButton() : ''}
            </arpa-node>
            ${!isInline ? this.renderButton() : ''}
        `;
    }

    // #endregion Rendering

    ////////////////////////////
    // #region Lifecycle
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

    async $onContentSet() {
        await this.promise;
        this._textContent = this.contentNode?.textContent?.trim() || '';
        this._childNodes = [...(this.contentNode?.childNodes || [])];
        this.reRender();
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        this.ellipsisNode = /** @type {HTMLElement} */ (this.nodes.ellipsis);
        this.ellipsisNode?.remove();
        await this.waitForArpaNodes(this.arpaNodes, { waitForDeferred: true });
        if (!this.canTruncate()) {
            const button = this.querySelector('.truncateText__button');
            button?.remove();
        }

        return true;
    }

    async $onComplete() {
        if (this.hasProp('isTruncated')) {
            this.setAttribute('is-truncated', '');
        } else {
            this.removeAttribute('is-truncated');
        }
        this.initializeClampBehavior();

        return true;
    }

    /**
     * Called when a zone is inserted into the element.
     * @param {ArpaZone} zone
     * @returns {Promise<boolean>}
     */
    async $onZoneInserted(zone) {
        if (this._hasRendered) {
            if (this.contentNode instanceof HTMLElement) {
                this.contentNode.style.display = 'none';
                this.contentNode?.append(...(zone.fragment?.childNodes || []));
            }
            this.$onContentSet();
        }
        return false;
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
        let content = (this._textContent || this.textContent || '').trim();
        if (!content) {
            content = this.contentNode?.textContent?.trim() || '';
        }
        return content.length > maxLength;
    }

    isTruncated() {
        return (
            this.truncatedNode?.isConnected ||
            this.classList.contains(this.getProp('className') + '--truncateLines')
        );
    }

    getMaxLines() {
        if (this.hasAttribute('truncate-content')) {
            return undefined;
        }
        const maxLines = this.getProp('maxLines');
        if (!maxLines) return undefined;
        return parseInt(maxLines, 10) || 1;
    }

    truncateText() {
        const maxLines = this.getMaxLines();
        if (maxLines) {
            this.classList.add(this.getProp('className') + '--truncateLines');
            this.style.setProperty('--max-lines', maxLines.toString());
            this.computeClampState();
        } else {
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
        }
        this.button = /** @type {ArpaButton} */ (this.nodes.button);
        this.button?.setLabel?.(this.getProp('lblShow'));
        this.button?.setProp?.('rhsIcon', this.getProp('icon'));
        this.miniButton = this.nodes.miniButton;

        this.miniButton?.setTooltip(this.getProp('lblShow'));
        this.miniButton?.setIcon(this.getProp('icon'));
    }

    showFullContent() {
        const maxLines = this.getMaxLines();
        if (maxLines) {
            this.classList.remove(this.getProp('className') + '--truncateLines');
            this.style.setProperty('--max-lines', '10000000');
            this.computeClampState();
        } else {
            if (this.contentNode instanceof HTMLElement && this.truncatedNode instanceof HTMLElement) {
                this.truncatedNode?.replaceWith(this.contentNode);
            }
            this.ellipsisNode?.remove();
        }
        this.button?.setLabel(this.getProp('lblHide'));
        this.button?.setProp('rhsIcon', this.getProp('iconHide'));

        this.miniButton = this.nodes.miniButton;
        this.miniButton?.setIcon(this.getProp('iconHide'));
        this.miniButton?.setTooltip(this.getProp('lblHide'));

        this.removeAttribute('is-truncated');
    }

    toggleTruncate() {
        this.isTruncated() ? this.removeAttribute('is-truncated') : this.setAttribute('is-truncated', '');
    }

    // #endregion Truncation

    ///////////////////
    // #region Clamp
    //////////////////

    async initializeClampBehavior() {
        this.miniButton = /** @type {IconButton} */ (this.nodes.miniButton) || this.miniButton;
        if (!this.miniButton) {
            return;
        }
        /** @type {ReturnType<typeof setTimeout> | undefined} */
        let resizeTimer;
        const observer = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.computeClampState(), 100);
        });
        observer.observe(this.nodes.content, { box: 'border-box' });
    }

    async computeClampState() {
        await new Promise(resolve => setTimeout(resolve, 0));
        const node = this.nodes.content;
        const isClamped = node.scrollHeight > node.clientHeight;
        if (isClamped) {
            this.setAttribute('is-clamped', '');
        } else {
            this.removeAttribute('is-clamped');
        }
    }

    // #endregion Clamp
}

defineCustomElement('truncate-text', TruncateText);

export default TruncateText;
