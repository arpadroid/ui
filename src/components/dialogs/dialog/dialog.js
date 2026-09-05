/**
 * @typedef {import('./dialog.types').DialogConfigType} DialogConfigType
 * @typedef {import('../dialogs/dialogs.js').default} Dialogs
 * @typedef {import('../../buttons/button/button.js').default} ArpaButton
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
        /** @type {DialogConfigType} */
        const config = {
            open: false,
            className: 'dialog',
            persist: false,
            variant: 'default',
            canClose: true,
            container: document.body,
            attributes: {
                role: 'dialog'
            }
        };
        return /** @type {DialogConfigType} */ (super.getDefaultConfig(config));
    }

    $preInitialize() {
        this.bind('open', 'close');
        this.originalParent = /** @type {HTMLElement & { dialog?: Dialog }} */ (
            this.parentNode instanceof HTMLElement ? this.parentNode : null
        );
        this.originalParent && (this.originalParent.dialog = this);
        this.signal = this.signal || dummySignal;
        this.on = this.on || dummySignal;
        observerMixin(this);
    }

    async $resolveRender() {
        return await this._initializeDialog();
    }

    getContainer() {
        let container = this.getProp('container') || document.body;
        if (typeof container === 'string') {
            container = document.querySelector(container) || document.body;
        }
        return container;
    }

    /**
     * It will append the dialog to the dialogs component if not already added.
     * If the dialogs component does not exist, it will create it and append it to the body.
     * @returns {Promise<boolean | undefined>}
     */
    async _initializeDialog() {
        await this._initializeButton();
        const dialogsTagName = 'arpa-dialogs';
        /** @type {Dialogs | null} */
        this.dialogs = this.dialogs || this.closest(dialogsTagName);
        if (this.dialogs) {
            return;
        }
        const dialogsId = this.getProp('dialogs-id') || dialogsTagName;
        this.dialogs = /** @type {Dialogs | null} */ (document.getElementById(dialogsId));
        if (this.dialogs) {
            await this.dialogs.promise;
            await this.dialogs.addDialog(this);
            this.initialized = true;
            return true;
        } else {
            this.dialogs = /** @type {Dialogs | null} */ (
                renderNode(html`<arpa-dialogs ${attrString({ id: dialogsId })}></arpa-dialogs>`)
            );
            const container = this.getContainer();
            this.dialogs && container.appendChild(this.dialogs);
            await this.dialogs?.promise;
        }
        if (this.parentNode !== this.dialogs && !this.initialized) {
            await this.dialogs?.addDialog(this);
            this.initialized = true;
        }
    }

    async _initializeButton() {
        const btn = await this.getButton();
        listen(btn, 'click', this.open);
        const arpaButton = /** @type {ArpaButton} */ (this.closest('arpa-button'));
        arpaButton && (await arpaButton?.promise);
        return arpaButton;
    }

    async getButton() {
        const button = this.closest('button');
        if (button) return button;
        /** @type {HTMLElement & { dialog?: Dialog, promise?: Promise<void> } | undefined} */
        const parent = this.originalParent;
        parent?.promise && (await parent?.promise);
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
        this.callCallback('onOpen', this);
        this.canClose() && document.addEventListener('keyup', this.$onKeyUp);
    }

    close() {
        document.body.style.overflow = '';
        this.removeAttribute('open');
        this.signal('close');
        this.callCallback('onClose', this);
        this.canClose() && document.removeEventListener('keyup', this.$onKeyUp);
    }

    /**
     * Closes the dialog when the escape key is pressed.
     * @param {KeyboardEvent} event
     * @private
     */
    $onKeyUp = event => {
        event.key === 'Escape' && this.close();
    };

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

    // #endregion Accessors

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
                        on-click="{close}"
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
