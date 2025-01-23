/**
 * @typedef {import('../dialog/dialog.js').default} Dialog
 */
import ArpaElement from '../../arpaElement/arpaElement.js';
// @ts-ignore
import { isObject, renderNode, attrString } from '@arpadroid/tools';

const html = String.raw;
class Dialogs extends ArpaElement {
    static initializeDialogsComponent(id = 'arpa-dialogs') {
        const dialogs = typeof id === 'string' && document.getElementById(id);
        if (dialogs) return dialogs;
        const dialogsComponent = renderNode(html`<arpa-dialogs id="${id}"></arpa-dialogs>`);
        document.body.appendChild(dialogsComponent);
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
     * @param {HTMLElement} dialog - The dialog to add.
     */
    addDialog(dialog) {
        if (isObject(dialog)) {
            dialog = renderNode(html`<arpa-dialog ${attrString(dialog)}></arpa-dialog>`);
        }
        dialog instanceof HTMLElement && this.appendChild(dialog);
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
customElements.define('arpa-dialogs', Dialogs);

export default Dialogs;
