export type AbstractContentInterface = string | number | HTMLElement;
export * from './components/arpaElement/arpaElement.types';
export * from './components/inputCombo/inputCombo.types';
export * from './components/pager/pager.types';
export * from './components/pager/components/pagerItem/pagerItem.types';
export * from './components/button/button.types';
export * from './components/iconButton/iconButton.types';
export * from './components/dialogs/dialog/dialog.types';
export * from './components/dropArea/dropArea.types';

declare global {
    interface Window {
        arpaSafeIDs: Record<string, boolean>;
        i18nInstance: any;
    }
}
