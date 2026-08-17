/**
 * @typedef {import('./deleteDialog.types').DeleteDialogConfigType} DeleteDialogConfigType
 */
import ConfirmDialog from '../confirmDialog/confirmDialog.js';
import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
class DeleteDialog extends ConfirmDialog {
    /**
     * Returns the default component config.
     * @returns {DeleteDialogConfigType}
     */
    getDefaultConfig() {
        const superConf = super.getDefaultConfig();
        this.i18nKey = 'ui.deleteDialog';
        /** @type {DeleteDialogConfigType} */
        const config = {
            id: 'delete-dialog',
            title: 'Delete',
            icon: 'delete',
            canClose: true,
            confirmIcon: 'delete',
            lblConfirm: '{i18n:lblConfirm}',
            attributes: {
                variant: 'delete'
            }
        };
        return mergeObjects(superConf, config);
    }
}

defineCustomElement('delete-dialog', DeleteDialog);

export default DeleteDialog;
