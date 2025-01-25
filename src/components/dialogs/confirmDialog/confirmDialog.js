/**
 * @typedef {import('./confirmDialog.types.js').ConfirmDialogConfigType} ConfirmDialogConfigType
 */
import Dialog from '../dialog/dialog.js';

const html = String.raw;
class ConfirmDialog extends Dialog {
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

    _initializeNodes() {
        super._initializeNodes();
        this.confirmBtn = this.querySelector('.confirmDialog__confirmBtn');
        this.confirmBtn?.addEventListener('click', this.confirm);

        this.cancelBtn = this.querySelector('.confirmDialog__cancelBtn');
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
     * @returns {HTMLElement}
     */
    renderFooter(
        confirmIcon = this.getProperty('confirm-icon'),
        lblConfirm = this.i18n('lblConfirm'),
        cancelIcon = this.getProperty('cancel-icon'),
        lblCancel = this.i18n('lblCancel')
    ) {
        const content = html`<div class="dialog__controls">
            <button class="confirmDialog__cancelBtn" is="arpa-button" icon="${cancelIcon}">
                ${lblCancel}
            </button>
            <button class="confirmDialog__confirmBtn" is="arpa-button" icon="${confirmIcon}">
                ${lblConfirm}
            </button>
        </div>`;
        return super.renderFooter(content);
    }

    _onDestroy() {
        super._onDestroy();
        this.confirmBtn?.removeEventListener('click', this.confirm);
        this.cancelBtn?.removeEventListener('click', this.cancel);
    }
}

customElements.define('confirm-dialog', ConfirmDialog);

export default ConfirmDialog;
