import Dialog from '../../dialog.js';

const html = String.raw;
class DeleteDialog extends Dialog {
    ////////////////////////////
    // #region Initialization
    ////////////////////////////

    _initializeContent() {
        super._initializeContent();
        console.log('this._content', this._content);
    }

    getDefaultConfig() {
        return super.getDefaultConfig({
            id: 'delete-dialog',
            title: 'Delete Item',
            variant: 'delete',
            icon: 'delete',
            canClose: true,
            content: html`<p>Are you sure you want to delete this item?</p>`,
            attributes: {
                role: 'alertdialog'
            }
        });
    }
}

customElements.define('delete-dialog', DeleteDialog);

export default DeleteDialog;
