import Dialog from '../dialog/dialog.js';

const html = String.raw;
class ConfirmDialog extends Dialog {
    ////////////////////////////
    // #region Initialization
    ////////////////////////////

    getDefaultConfig() {
        this.bind('confirm', 'cancel');
        this.i18nKey = 'components.confirmDialog';
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
        this.cancelBtn = this.querySelector('.confirmDialog__cancelBtn');
        this.cancelBtn?.focus();
        this.confirmBtn.addEventListener('click', this.confirm);
        this.cancelBtn.addEventListener('click', this.cancel);
    }

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
        this.confirmBtn.removeEventListener('click', this.confirm);
        this.cancelBtn.removeEventListener('click', this.cancel);
    }
}

customElements.define('confirm-dialog', ConfirmDialog);

export default ConfirmDialog;
