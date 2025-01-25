import { DialogConfigType } from '../dialog/dialog.types';

export type ConfirmDialogConfigType = DialogConfigType & {
    confirmIcon?: string;
    cancelIcon?: string;
    lblConfirm?: string;
    lblCancel?: string;
    payload?: Record<string, unknown>;
};
