/**
 * @typedef {import('./confirmDialog.types.js').ConfirmDialogConfigType} ConfirmDialogConfigType
 * @typedef {import('../../buttons/button/button.js').default} Button
 */
import { defineCustomElement, mergeObjects, listen } from '@arpadroid/tools';
import Dialog from '../dialog/dialog.js';

const html = String.raw;
class ConfirmDialog extends Dialog {
    /** @type {ConfirmDialogConfigType} */
    _config = this._config;

    /**
     * Returns the default component config.
     * @returns {ConfirmDialogConfigType}
     */
    getDefaultConfig() {
        this.bind('confirm', 'cancel', 'open', 'close');
        this.i18nKey = 'ui.confirmDialog';
        /** @type {ConfirmDialogConfigType} */
        const config = {
            attributes: {
                variant: 'confirm',
                role: 'alertdialog',
                size: 'small'
            },
            cancelIcon: 'cancel',
            canClose: false,
            confirmIcon: 'check_circle',
            icon: 'warning',
            id: 'confirm-dialog',
            lblCancel: '{i18n:lblCancel}',
            lblConfirm: '{i18n:lblConfirm}',
            payload: undefined
        };
        return mergeObjects(super.getDefaultConfig(), config);
    }

    /**
     * Sets the payload for the dialog.
     * @param {unknown} payload - The payload to set.
     */
    setPayload(payload) {
        this._config.payload = payload;
    }

    cancel() {
        this.close();
        this.signal('cancel', this._config.payload);
        this.callCallback('@onCancel', this._config.payload);
    }

    confirm() {
        const { payload } = this._config;
        this.signal('confirm', payload);
        this.callCallback('@onConfirm', payload);
        this.close();
    }

    $renderTemplate() {
        return html`
            ${super.$renderTemplate()}
            <arpa-zone name="footer">
                <div class="dialog__controls">
                    <arpa-button class="confirmDialog__cancelBtn" icon="{cancelIcon}">
                        {lblCancel}
                    </arpa-button>
                    <arpa-button class="confirmDialog__confirmBtn" icon="{confirmIcon}">
                        {lblConfirm}
                    </arpa-button>
                </div>
            </arpa-zone>
        `;
    }

    async $onComplete() {
        super.$onComplete();
        /** @type {Button | null} */
        this.confirmBtn = this.querySelector('.confirmDialog__confirmBtn');
        this.confirmBtn?.promise?.then(() => {
            listen(this.confirmBtn?.button, 'click', this.confirm);
        });
        /** @type {Button | null} */
        this.cancelBtn = this.querySelector('.confirmDialog__cancelBtn');
        this.cancelBtn?.promise?.then(() => {
            this.cancelBtn?.button?.focus();
            listen(this.cancelBtn?.button, 'click', this.cancel);
        });
    }
}

defineCustomElement('confirm-dialog', ConfirmDialog);

export default ConfirmDialog;
