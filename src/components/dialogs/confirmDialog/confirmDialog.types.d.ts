import { DialogConfigType } from '../dialog/dialog.types';

export type ConfirmDialogConfigType = DialogConfigType & {
    confirmIcon?: string;
    cancelIcon?: string;
    lblConfirm?: string;
    lblCancel?: string;
    payload?: unknown;
    '@onConfirm'?: (payload: unknown) => void;
    '@onCancel'?: (payload: unknown) => void;
};
