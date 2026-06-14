/**
 * @typedef {import('./dialog.types').DialogConfigType} DialogConfigType
 * @typedef {import('../dialogs/dialogs.js').default} Dialogs
 */

import ArpaElement from '../../core/arpaElement/arpaElement.js';
import { observerMixin, renderNode } from '@arpadroid/tools';
import { attrString, dummySignal, defineCustomElement, listen } from '@arpadroid/tools';

const html = String.raw;
class Dialog extends ArpaElement {
    /** @type {DialogConfigType} */
    _config = this._config;

    ////////////////////////////
    // #region Initialization
    ////////////////////////////

    /**
     * Returns default config.
     * @returns {DialogConfigType}
     */
    getDefaultConfig() {
        this.bind('open', 'close');
        /** @type {DialogConfigType} */
        const config = {
            open: false,
            className: 'dialog',
            persist: false,
            variant: 'default',
            canClose: true,
            attributes: {
                role: 'dialog'
            }
        };
        return /** @type {DialogConfigType} */ (super.getDefaultConfig(config));
    }

    $preInitialize() {
        this.originalParent = /** @type {HTMLElement & { dialog?: Dialog }} */ (
            this.parentNode instanceof HTMLElement ? this.parentNode : null
        );
        this.originalParent && (this.originalParent.dialog = this);
        this.signal = this.signal || dummySignal;
        this.on = this.on || dummySignal;
        observerMixin(this);
    }

    /**
     * Manual allocation of zones.
     * @param {import('../../../tools/zoneTool.types.js').ZoneToolPlaceZoneType} payload
     * @returns {boolean | undefined}
     */
    _onLostZone({ zoneName, zone }) {
        if (!zoneName || !zone) return false;
        if (['content'].includes(zoneName) && zone._parentNode === this) {
            this.promise.then(() => this.contentNode?.append(...zone.childNodes));
            return true;
        }
    }

    async _resolveRender() {
        await this._initializeDialog();
        return this.resolvePromise?.(true);
    }

    /**
     * It will append the dialog to the dialogs component if not already added.
     * If the dialogs component does not exist, it will create it and append it to the body.
     * @returns {Promise<boolean | undefined>}
     */
    async _initializeDialog() {
        this._initializeButton();
        const dialogsTagName = 'arpa-dialogs';
        /** @type {Dialogs | null} */
        this.dialogs = this.dialogs || this.closest(dialogsTagName);
        if (this.dialogs) return;
        const dialogsId = this.getProp('dialogs-id') || dialogsTagName;

        this.dialogs = /** @type {Dialogs | null} */ (document.getElementById(dialogsId));
        if (this.dialogs) {
            await this.dialogs.promise;
            await this.dialogs.addDialog(this);
            return true;
        }
        if (!this.dialogs) {
            this.dialogs = /** @type {Dialogs | null} */ (
                renderNode(html`<arpa-dialogs ${attrString({ id: dialogsId })}></arpa-dialogs>`)
            );
            this.dialogs && document.body.appendChild(this.dialogs);
            await this.dialogs?.promise;
        }
        if (this.parentNode !== this.dialogs) {
            if (typeof this.dialogs?.addDialog !== 'function') {
                await customElements.whenDefined(dialogsTagName);
            }
            await this.dialogs?.addDialog(this);
        }
    }

    async _initializeButton() {
        const button = await this.getButton();
        button && listen(button, 'click', this.open);
    }

    async getButton() {
        const button = this.closest('button');
        if (button) return button;
        /** @type {HTMLElement & { dialog?: Dialog, promise?: Promise<void> } | undefined} */
        const parent = this.originalParent;
        parent && (await parent?.promise);
        return parent?.closest('button') || parent?.querySelector('button');
    }

    // #endregion Initialization

    ////////////////////////////
    // #region Accessors
    ////////////////////////////

    canClose() {
        return this.getProp('can-close');
    }

    isPersist() {
        return this.getProp('persist');
    }

    open() {
        document.body.style.overflow = 'hidden';
        this.setAttribute('open', '');
        this.signal('open');
        this.callCallback('@onOpen', this);
    }

    close() {
        document.body.style.overflow = '';
        this.removeAttribute('open');
        this.signal('close');
        this.callCallback('@onClose', this);
    }

    isOpen() {
        return this.hasProp('open');
    }

    toggle() {
        return this.isOpen() ? this.close() : this.open();
    }

    hasTitle() {
        return this.hasContent('title');
    }

    hasHeader() {
        return this.hasTitle() || this.canClose() || this.hasContent('header');
    }

    hasPreloader() {
        const { promise } = this._config;
        return typeof promise?.finally === 'function';
    }

    ////////////////////////////
    // #endregion Accessors
    ////////////////////////////

    ////////////////////////////
    // #region Rendering
    ////////////////////////////

    _preRender() {
        super._preRender();
        const { variant } = this.getProperties('variant');
        variant && this.classList.add(`dialog--${variant}`);
    }

    $renderTemplate() {
        return html`<div class="dialog__wrapper">
            <arpa-node tag="header" name="header" can-render="hasHeader()">
                <arpa-node can-render="hasTitle() || icon" name="headerContent" zone="header">
                    <h2 class="dialog__title" zone="title">
                        <arpa-node name="icon" tag="arpa-icon"></arpa-node>
                        <arpa-node name="titleText" zone="title-text">{title}</arpa-node>
                    </h2>
                </arpa-node>
                <arpa-node name="headerActions">
                    <arpa-node
                        tag="icon-button"
                        can-render="canClose"
                        variant="minimal"
                        name="close"
                        class="dialog__close iconButton--mini"
                        icon="close"
                    ></arpa-node>
                </arpa-node>
            </arpa-node>
            <arpa-node name="contentTop"></arpa-node>
            <div class="dialog__body" zone="content-wrapper">
                <arpa-node tag="circular-spinner" name="preloader" can-render="hasPreloader()"></arpa-node>
                <arpa-node name="content" is-content></arpa-node>
            </div>
            <arpa-node tag="footer" name="footer"> </arpa-node>
        </div>`;
    }

    async $initializeNodes() {
        this.wrapperNode = this.querySelector('.dialog__wrapper');
        this.headerNode = this.querySelector('.dialog__header');
        this.contentNode = this.querySelector('.dialog__content');
        this.footerNode = this.querySelector('.dialog__footer');
        this.closeBtn = this.querySelector('.dialog__close');
        this.closeBtn?.addEventListener('click', this.close);
        this.preloader = this.querySelector('.dialog__preloader');
        const { promise } = this._config;
        promise?.finally(() => {
            this.preloader?.remove();
        });
        return true;
    }

    ////////////////////////////
    // #endregion Rendering
    ////////////////////////////
}

defineCustomElement('arpa-dialog', Dialog);

export default Dialog;
