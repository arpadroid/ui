import ConfirmDialog from '../confirmDialog/confirmDialog.js';
import { mergeObjects } from '@arpadroid/tools';
class DeleteDialog extends ConfirmDialog {
    ////////////////////////////
    // #region Initialization
    ////////////////////////////

    getDefaultConfig() {
        const defaultConfig = super.getDefaultConfig();
        this.i18nKey = 'components.deleteDialog';
        return mergeObjects(defaultConfig, {
            id: 'delete-dialog',
            title: 'Delete',
            icon: 'delete',
            canClose: true,
            confirmIcon: 'delete',
            attributes: {
                variant: 'delete'
            }
        });
    }
}

customElements.define('delete-dialog', DeleteDialog);

export default DeleteDialog;
