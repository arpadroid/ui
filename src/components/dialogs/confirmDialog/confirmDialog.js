/**
 * @typedef {import('./confirmDialog.types.js').ConfirmDialogConfigType} ConfirmDialogConfigType
 * @typedef {import('../../button/button.js').default} Button
 */
import { defineCustomElement } from '@arpadroid/tools';
import Dialog from '../dialog/dialog.js';

const html = String.raw;
class ConfirmDialog extends Dialog {
    /** @type {ConfirmDialogConfigType} */
    _config = this._config;
    ////////////////////////////
    // #region Initialization
    ////////////////////////////

    /**
     * Returns the default component config.
     * @returns {ConfirmDialogConfigType}
     */
    getDefaultConfig() {
        this.bind('confirm', 'cancel', 'open', 'close');
        this.i18nKey = 'ui.confirmDialog';
        return {
            id: 'confirm-dialog',
            icon: 'warning',
            canClose: false,
            payload: undefined,
            confirmIcon: 'check_circle',
            cancelIcon: 'cancel',
            attributes: {
                variant: 'confirm',
                role: 'alertdialog',
                size: 'small'
            }
        };
    }

    async _initializeNodes() {
        await super._initializeNodes();
        this.confirmBtn = this.querySelector('.confirmDialog__confirmBtn');
        this.confirmBtn?.addEventListener('click', this.confirm);
        /** @type {Button | null} */
        this.cancelBtnComponent = this.querySelector('.confirmDialog__cancelBtn');
        this._initializeCancelBtn();
        return true;
    }

    async _initializeCancelBtn() {
        await customElements.whenDefined('arpa-button');
        await this.cancelBtnComponent?.promise;
        this.cancelBtn = this.cancelBtnComponent?.button;
        if (this.cancelBtn instanceof HTMLButtonElement) {
            this.cancelBtn?.focus();
            this.cancelBtn.addEventListener('click', this.cancel);
        }
    }

    /**
     * Sets the payload for the dialog.
     * @param {Record<string, unknown>} payload - The payload to set.
     */
    setPayload(payload) {
        this._config.payload = payload;
    }

    cancel() {
        this.close();
        this.signal('cancel', this._config.payload);
    }

    confirm() {
        const { payload } = this._config;
        this.signal('confirm', payload);
        this.close();
    }

    /**
     * Renders the dialog footer.
     * @param {string} [confirmIcon]
     * @param {string} [lblConfirm]
     * @param {string} [cancelIcon]
     * @param {string} [lblCancel]
     * @returns {string}
     */
    renderFooter(
        confirmIcon = this.getProperty('confirm-icon'),
        lblConfirm = this.i18n('lblConfirm'),
        cancelIcon = this.getProperty('cancel-icon'),
        lblCancel = this.i18n('lblCancel')
    ) {
        const content = html`<div class="dialog__controls">
            <arpa-button class="confirmDialog__cancelBtn" icon="${cancelIcon}"> ${lblCancel} </arpa-button>
            <arpa-button class="confirmDialog__confirmBtn" icon="${confirmIcon}"> ${lblConfirm} </arpa-button>
        </div>`;
        return super.renderFooter(content);
    }

    _onDestroy() {
        super._onDestroy();
        this.confirmBtn?.removeEventListener('click', this.confirm);
        this.cancelBtn?.removeEventListener('click', this.cancel);
    }
}

defineCustomElement('confirm-dialog', ConfirmDialog);

export default ConfirmDialog;
