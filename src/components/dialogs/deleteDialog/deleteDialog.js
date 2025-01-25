import ConfirmDialog from '../confirmDialog/confirmDialog.js';
import { mergeObjects } from '@arpadroid/tools';
class DeleteDialog extends ConfirmDialog {
    ////////////////////////////
    // #region Initialization
    ////////////////////////////
    /**
     * Returns the default component config.
     * @returns {import('./deleteDialog.types.js').DeleteDialogConfigType}
     */
    getDefaultConfig() {
        const defaultConfig = super.getDefaultConfig();
        this.i18nKey = 'ui.deleteDialog';
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
