import '@arpadroid/module/types';

export {
    ArpaElementConfigType,
    TemplateContentMode,
    TemplatesType,
    SetTemplateConfigType,
    ArpaElementTemplateType
} from './components/core/arpaElement/arpaElement.types';

export * from './components/inputCombo/inputCombo.types';
export * from './components/pager/pager.types';
export * from './components/pager/components/pagerItem/pagerItem.types';
export * from './components/buttons/button/button.types';
export * from './components/buttons/iconButton/iconButton.types';
export * from './components/dialogs/dialog/dialog.types';
export * from './components/dropArea/dropArea.types';
export * from './components/image/image.types';
export * from './components/dialogs/dialog/dialog.types';
export * from './components/dialogs/confirmDialog/confirmDialog.types';
export * from './components/dialogs/deleteDialog/deleteDialog.types';
export * from './components/preloaders/circularSpinner/circularSpinner.types';
export * from './components/dropArea/dropArea.types';
export * from './components/truncateText/truncateText.types';

declare global {
    interface Window {
        arpaSafeIDs: Record<string, boolean>;
    }
}
