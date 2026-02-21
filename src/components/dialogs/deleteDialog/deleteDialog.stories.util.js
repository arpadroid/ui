/**
 * @typedef {import('./deleteDialog').default} DeleteDialog
 * @typedef {import('../dialogs/dialogs').default} Dialogs
 */
import { within } from 'storybook/test';

/**
 * Sets up the testing environment for the DeleteDialog component.
 * @param {HTMLElement} canvasElement
 * @param {string} [tagName]
 * @returns {Promise<{canvas: any, dialogNode: DeleteDialog, dialogsNode: Dialogs}>}
 */
export async function playSetup(canvasElement, tagName = 'delete-dialog') {
    const canvas = within(canvasElement);
    await customElements.whenDefined(tagName);
    await customElements.whenDefined('arpa-dialogs');
    const dialogsNode = /** @type {Dialogs} */ (document.querySelector('arpa-dialogs'));
    const dialogNode = /** @type {DeleteDialog} */ (document.querySelector(tagName));
    return { canvas, dialogNode, dialogsNode };
}
