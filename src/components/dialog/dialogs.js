import ArpaElement from '../arpaElement/arpaElement.js';
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
            zoneSelector: ':scope > zone'
        });
    }

    _initialize() {
        this.bind('_onKeyUp');
        document.addEventListener('keyup', this._onKeyUp);
    }

    _onKeyUp(event) {
        if (event.key === 'Escape') this.closeCurrentDialog();
    }

    getDialogs() {
        return Array.from(this.querySelectorAll('arpa-dialog'));
    }

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

    closeDialog(id) {
        const dialog = this.querySelector(`#${id}`);
        dialog?.close();
    }
}
customElements.define('arpa-dialogs', Dialogs);

export default Dialogs;
