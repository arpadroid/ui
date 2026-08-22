/**
 * @typedef {import('./deleteDialog.types').DeleteDialogConfigType} DeleteDialogConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<DeleteDialogConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<DeleteDialogConfigType>} Story
 * @typedef {import('./deleteDialog').default} DeleteDialog
 * @typedef {import('../dialogs/dialogs').default} Dialogs
 */

import { expect, within, waitFor, userEvent, fn } from 'storybook/test';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import { $attr } from '@arpadroid/tools';

const dialogText = 'Are you sure you want to delete this item?';
const html = String.raw;

const onConfirm = fn(() => {});
const onCancel = fn(() => {});

/** @type {Meta} */
const DeleteDialogStory = {
    title: 'UI/Dialogs/Delete',
    component: 'delete-dialog',
    args: {
        id: 'delete',
        title: 'Delete',
        open: true
    },
    render: args => {
        return html`
            <arpa-dialogs>
                <delete-dialog ${$attr(args)}>${dialogText}</delete-dialog>
            </arpa-dialogs>
        `;
    }
};

/** @type {Story} */
export const Default = {
    name: 'Render',
    parameters: defaultParams
};

/** @type {Story} */
export const Test = {
    parameters: testParams,
    args: {
        id: 'delete-test'
    },
    play: async context => {
        const { step } = context;

        await customElements.whenDefined('delete-dialog');
        await customElements.whenDefined('arpa-dialogs');
        const dialogsNode = /** @type {Dialogs} */ (document.querySelector('arpa-dialogs'));
        const dialogNode = /** @type {DeleteDialog} */ (document.querySelector('delete-dialog'));
        await dialogNode?.promise;

        const dialog = within(dialogNode);
        dialogNode.on('cancel', onCancel);
        dialogNode.on('confirm', onConfirm);

        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);
            expect(dialog.getByRole('heading', { name: /Delete/i })).toBeInTheDocument();
            await waitFor(() => {
                expect(dialog.getByText('Are you sure you want to delete this item?')).not.toBeNull();
            });
        });

        await step('Emits cancel event on cancel action', async () => {
            await dialogNode.open();
            const cancelButton = await waitFor(() => dialog.getByRole('button', { name: /cancel/i }));
            expect(cancelButton).toBeInTheDocument();
            await new Promise(resolve => setTimeout(resolve, 100));
            await userEvent.click(cancelButton);
            await waitFor(() => expect(dialogNode).not.toHaveAttribute('open'));
            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        await step('Emits confirm event on confirm action', async () => {
            await dialogNode.open();

            const confirmButton = dialog.getByRole('button', { name: /delete/i });
            expect(confirmButton).toBeInTheDocument();
            await userEvent.click(confirmButton);
            await waitFor(() => {
                expect(dialogNode).not.toHaveAttribute('open');

                expect(onConfirm).toHaveBeenCalled();
            });
        });

        await dialogNode.open();
    }
};

export default DeleteDialogStory;
