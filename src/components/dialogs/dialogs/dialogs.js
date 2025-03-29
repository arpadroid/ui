/**
 * @typedef {import('../dialog/dialog.js').default} Dialog
 * @typedef {import('../dialog/dialog.types.js').DialogConfigType} DialogConfigType
 */
import ArpaElement from '../../arpaElement/arpaElement.js';
import { isObject, renderNode, attrString, defineCustomElement } from '@arpadroid/tools';

const html = String.raw;
class Dialogs extends ArpaElement {
    static initializeDialogsComponent(id = 'arpa-dialogs') {
        const dialogs = typeof id === 'string' && document.getElementById(id);
        if (dialogs) return dialogs;
        const dialogsComponent = renderNode(html`<arpa-dialogs id="${id}"></arpa-dialogs>`);
        dialogsComponent && document.body.appendChild(dialogsComponent);
    }

    getDefaultConfig() {
        return super.getDefaultConfig({
            id: 'dialogs',
            dialogTypes: ['arpa-dialog', 'confirm-dialog', 'delete-dialog']
        });
    }

    _initialize() {
        this.bind('_onKeyUp');
        document.addEventListener('keyup', this._onKeyUp);
    }

    /**
     * Handles key up events.
     * @param {KeyboardEvent} event - The keyboard event.
     */
    _onKeyUp(event) {
        if (event.key === 'Escape') this.closeCurrentDialog();
    }

    getDialogs() {
        return Array.from(this.querySelectorAll(this._config.dialogTypes.join(',')));
    }

    /**
     * Adds a dialog to the dialogs component.
     * @param {Dialog | DialogConfigType} dialog - The dialog to add.
     */
    addDialog(dialog) {
        if (dialog instanceof HTMLElement) {
            this.appendChild(dialog);
            dialog.connectedCallback(true);
            return;
        }
        if (isObject(dialog)) {
            const node = renderNode(html`<arpa-dialog ${attrString(dialog)}></arpa-dialog>`);
            node instanceof HTMLElement && this.appendChild(node);
        }
    }

    getCurrentDialog() {
        return this.getDialogs()
            .reverse()
            .find(dialog => dialog.open);
    }

    closeCurrentDialog() {
        const dialog = this.getCurrentDialog();
        dialog?.close();
    }

    /**
     * Closes a dialog by id.
     * @param {string} id
     */
    closeDialog(id) {
        /** @type {Dialog | null} */
        const dialog = this.querySelector(`#${id}`);
        dialog?.close();
    }
}

defineCustomElement('arpa-dialogs', Dialogs);

export default Dialogs;
