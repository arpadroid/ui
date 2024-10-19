/**
 * @typedef {import('./dialogInterface.js').DialogInterface} DialogInterface
 */

import ArpaElement from '../arpaElement/arpaElement.js';
import { ObserverTool, renderNode, attrString } from '@arpadroid/tools';

const html = String.raw;
class Dialog extends ArpaElement {
    ////////////////////////////
    // #region Initialization
    ////////////////////////////

    /**
     * Returns default config.
     * @returns {DialogInterface}
     */
    getDefaultConfig() {
        return super.getDefaultConfig({
            tagName: 'section',
            isOpen: false,
            persist: false,
            variant: 'default',
            canClose: true,
            attributes: {
                role: 'dialog'
            }
        });
    }

    _preInitialize() {
        this.bind('close', 'open');
        ObserverTool.mixin(this);
    }

    /**
     * It will append the dialog to the dialogs component if not already added.
     * If the dialogs component does not exist, it will create it and append it to the body.
     * @returns {Promise<void>}
     */
    async _initializeDialog() {
        const dialogsTagName = 'arpa-dialogs';
        this.dialogs = this.dialogs || this.closest(dialogsTagName);
        if (this.dialogs) return;
        const dialogsId = this.getProperty('dialogs-id') || dialogsTagName;
        this.dialogs = document.getElementById(dialogsId);
        if (this.dialogs) return this.dialogs.addDialog(this);
        if (!this.dialogs) {
            this.dialogs = renderNode(html`<arpa-dialogs ${attrString({ id: dialogsId })}></arpa-dialogs>`);
            document.body.appendChild(this.dialogs);
        }
        if (this.parentNode !== this.dialogs) {
            if (typeof this.dialogs.addDialog !== 'function') {
                await customElements.whenDefined(dialogsTagName);
            }
            this.dialogs.addDialog(this);
        }
    }

    getTagName() {
        return 'arpa-dialog';
    }

    _initializeContent() {
        const button = this.closest('button');
        button?.addEventListener('click', this.open);
        this._initializeDialog();
        super._initializeContent();
    }

    //////////////////////////////
    // #endregion Initialization
    /////////////////////////////

    ////////////////////////////
    // #region Accessors
    ////////////////////////////

    canClose() {
        return this.getProperty('can-close');
    }

    isPersist() {
        return this.getProperty('persist');
    }

    open() {
        document.body.style.overflow = 'hidden';
        this.setAttribute('open', '');
    }

    close() {
        document.body.style.overflow = '';
        this.removeAttribute('open');
    }

    isOpen() {
        return this.hasProperty('open');
    }

    toggle() {
        return this.isOpen() ? this.close() : this.open();
    }

    hasTitle() {
        return this.hasContent('title');
    }

    hasFooter() {
        return this.hasContent('footer');
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

    getTemplateVars() {
        return {
            header: this.renderHeader(),
            content: this.renderContent(),
            footer: this.renderFooter()
        };
    }

    render() {
        const { variant } = this.getProperties('variant');
        this.classList.add('dialog');
        variant && this.classList.add(`dialog--${variant}`);
        this.innerHTML = this.renderTemplate(
            html`<div class="dialog__wrapper">{header}{content}{footer}</div>`
        );
    }

    renderHeader() {
        if (!this.hasHeader()) return '';
        const { title, icon } = this.getProperties('title', 'icon');
        return html`
            <header class="dialog__header">
                ${(this.hasTitle() &&
                    html`<h2 class="dialog__title" zone="title">
                        ${icon ? html`<arpa-icon class="dialog__icon">${icon}</arpa-icon>` : ''}
                        <span class="dialog__titleText" zone="title-text">${title}</span>
                    </h2>`) ||
                ''}
                ${(this.canClose() &&
                    html`<button
                        variant="minimal"
                        is="icon-button"
                        class="dialog__close"
                        icon="close"
                    ></button>`) ||
                ''}
            </header>
        `;
    }

    renderContent() {
        const content = this.getProperty('content') || '';
        return html`
            ${(this.hasContent('content-top') &&
                html`<div class="dialog__contentTop" zone="content-top"></div>`) ||
            ''}
            <div class="dialog__body" zone="content-wrapper">
                ${(this.hasPreloader() &&
                    html`<circular-preloader class="dialog__preloader"></circular-preloader>`) ||
                ''}
                <div class="dialog__content" zone="children">${content}</div>
            </div>
        `;
    }

    renderFooter() {
        return (this.hasFooter() && html`<footer class="dialog__footer" zone="footer"></footer>`) || '';
    }

    _initializeNodes() {
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
    }

    ////////////////////////////
    // #endregion Rendering
    ////////////////////////////
}

customElements.define(Dialog.prototype.getTagName(), Dialog);

export default Dialog;
