import Dialog from '../../dialog.js';

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
            title: 'Confirm Action',
            variant: 'confirm',
            icon: 'warning',
            canClose: false,

            'i18n-lblConfirm': 'suck me',
            payload: null,
            // content: html`<p>Are you sure you want to proceed?</p>`,
            attributes: {
                role: 'alertdialog'
            },
            footer: html`<div class="dialog__controls">
                <button class="confirmDialog__cancelBtn" is="arpa-button" icon="cancel">
                    ${this.i18n('lblCancel')}
                </button>
                <button class="confirmDialog__confirmBtn" is="arpa-button" icon="check_circle">
                    ${this.i18n('lblConfirm')}
                </button>
            </div>`
        };
    }

    _initializeNodes() {
        super._initializeNodes();
        this.confirmBtn = this.querySelector('.confirmDialog__confirmBtn');
        this.cancelBtn = this.querySelector('.confirmDialog__cancelBtn');
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

    _onDestroy() {
        this.confirmBtn.removeEventListener('click', this.confirm);
        this.cancelBtn.removeEventListener('click', this.cancel);
    }
}

customElements.define('confirm-dialog', ConfirmDialog);

export default ConfirmDialog;
