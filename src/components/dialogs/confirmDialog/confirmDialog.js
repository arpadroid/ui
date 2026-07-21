/**
 * @typedef {import('./confirmDialog.types.js').ConfirmDialogConfigType} ConfirmDialogConfigType
 * @typedef {import('../../buttons/button/button.js').default} Button
 */
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
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
            lblConfirm: '{i18n:lblConfirm}'
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
        this.callCallback('onCancel', this._config.payload);
    }

    confirm() {
        const { payload } = this._config;
        this.signal('confirm', payload);
        this.callCallback('onConfirm', payload);
        this.close();
    }

    $renderTemplate() {
        return html`
            ${super.$renderTemplate()}
            <arpa-zone name="footer">
                <div class="dialog__controls">
                    <arpa-node
                        name="cancelBtn"
                        tag="arpa-button"
                        on-click="{cancel}"
                        class="confirmDialog__cancelBtn"
                        icon="{cancelIcon}"
                    >
                        {lblCancel}
                    </arpa-node>
                    <arpa-node
                        name="confirmBtn"
                        tag="arpa-button"
                        on-click="{confirm}"
                        class="confirmDialog__confirmBtn"
                        icon="{confirmIcon}"
                    >
                        {lblConfirm}
                    </arpa-node>
                </div>
            </arpa-zone>
        `;
    }

    async $onComplete() {
        super.$onComplete();
        this.cancelBtn = /** @type {Button | null} */ (this.nodes.cancelBtn);
        this.cancelBtn?.focus();
    }
}

defineCustomElement('confirm-dialog', ConfirmDialog);

export default ConfirmDialog;
