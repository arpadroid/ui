
import { ConfirmDialogConfigType } from "../confirmDialog/confirmDialog.types";

export type DeleteDialogConfigType = ConfirmDialogConfigType & {
    onDelete?: () => void;
};
