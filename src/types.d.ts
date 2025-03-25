export { ArpaElementConfigType } from './components/arpaElement/arpaElement.types';
export * from './components/inputCombo/inputCombo.types';
export * from './components/pager/pager.types';
export * from './components/pager/components/pagerItem/pagerItem.types';
export * from './components/button/button.types';
export * from './components/iconButton/iconButton.types';
export * from './components/dialogs/dialog/dialog.types';
export * from './components/dropArea/dropArea.types';
export * from './components/image/image.types';
export * from './components/dialogs/dialog/dialog.types';
export * from './components/dialogs/confirmDialog/confirmDialog.types';
export * from './components/dialogs/deleteDialog/deleteDialog.types';
export * from './components/preloaders/circularPreloader/circularPreloader.types';
export * from './components/dropArea/dropArea.types';
export * from './components/truncateText/truncateText.types';

declare global {
    interface Window {
        arpaSafeIDs: Record<string, boolean>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18nInstance: any;
    }
}
