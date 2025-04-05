/**
 * @typedef {import('./dialog.types').DialogConfigType} DialogConfigType
 * @typedef {import('../dialogs/dialogs.js').default} Dialogs
 */

import ArpaElement from '../../arpaElement/arpaElement.js';
import { observerMixin, renderNode } from '@arpadroid/tools';
import { attrString, dummySignal, defineCustomElement, listen, processTemplate } from '@arpadroid/tools';

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
            persist: false,
            variant: 'default',
            canClose: true,
            attributes: {
                role: 'dialog'
            }
        };
        return /** @type {DialogConfigType} */ (super.getDefaultConfig(config));
    }

    _preInitialize() {
        this.originalParent = /** @type {import('@arpadroid/tools').ElementType} */ (
            this.parentNode instanceof HTMLElement ? this.parentNode : null
        );
        this.originalParent && (this.originalParent.dialog = this);
        this.signal = this.signal || dummySignal;
        observerMixin(this);
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
        const dialogsId = this.getProperty('dialogs-id') || dialogsTagName;
        
        this.dialogs = /** @type {Dialogs | null} */ (document.getElementById(dialogsId));
        if (this.dialogs) {
            await this.dialogs.promise;
            await this.dialogs.addDialog(this);
            return true;
        }
        if (!this.dialogs) {
            /** @type {Dialogs | null} */
            this.dialogs = renderNode(html`<arpa-dialogs ${attrString({ id: dialogsId })}></arpa-dialogs>`);
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

    getTagName() {
        return 'arpa-dialog';
    }

    async _initializeButton() {
        const button = await this.getButton();
        button && listen(button, 'click', this.open);
    }

    async getButton() {
        const button = this.closest('button');
        if (button) return button;
        /** @type {import('../../arpaElement/arpaElement.js').ElementType} */
        const parent = this.originalParent;
        parent && (await parent?.promise);
        return parent?.closest('button') || parent?.querySelector('button');
    }

    // #endregion Initialization

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
        this.signal('open');
    }

    close() {
        document.body.style.overflow = '';
        this.removeAttribute('open');
        this.signal('close');
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
            footer: this.renderFooter(),
            headerContent: this.renderHeaderContent()
        };
    }

    _preRender() {
        super._preRender();
        const { variant } = this.getProperties('variant');
        this.classList.add('dialog');
        variant && this.classList.add(`dialog--${variant}`);
    }

    _getTemplate() {
        return html`<div class="dialog__wrapper">{header}{content}{footer}</div>`;
    }

    renderTitle() {
        const { title, icon } = this.getProperties('title', 'icon');
        if (!this.hasTitle()) return '';
        return html`<h2 class="dialog__title" zone="title">
            ${icon ? html`<arpa-icon class="dialog__icon">${icon}</arpa-icon>` : ''}
            <span class="dialog__titleText" zone="title-text">${title || ''}</span>
        </h2>`;
    }

    renderHeaderContent() {
        if (!this.hasTitle() && !this.hasContent('icon')) return '';
        return processTemplate(
            html`<div class="dialog__headerContent" zone="header">${this.renderTitle() || ''}</div>`
        );
    }

    renderHeader() {
        if (!this.hasHeader()) return '';

        return html`
            <header class="dialog__header">
                {headerContent}
                <div class="dialog__headerActions" zone="header-actions">
                    ${(this.canClose() &&
                        html`<icon-button
                            variant="minimal"
                            class="dialog__close iconButton--mini"
                            icon="close"
                        ></icon-button>`) ||
                    ''}
                </div>
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
                <div class="dialog__content" zone="content">${content}</div>
            </div>
        `;
    }

    renderFooter(content = this._config?.footer || '') {
        return (
            ((this.hasFooter() || content) &&
                html`<footer class="dialog__footer" zone="footer">${content || ''}</footer>`) ||
            ''
        );
    }

    async _initializeNodes() {
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

defineCustomElement(Dialog.prototype.getTagName(), Dialog);

export default Dialog;
