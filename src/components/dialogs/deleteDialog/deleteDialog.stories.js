/**
 * @typedef {import('./deleteDialog.types').DeleteDialogConfigType} DeleteDialogConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<DeleteDialogConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<DeleteDialogConfigType>} Story
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */

import { expect, within, waitFor } from 'storybook/test';
import { renderDialog } from '../dialog/dialogStoryUtil';
import ConfirmDialogStory from '../confirmDialog/confirmDialog.stories';
import { playSetup } from './deleteDialog.stories.util';

const dialogText = 'Are you sure you want to delete this item?';
const tagName = 'delete-dialog';

/** @type {Meta} */
const DeleteDialogStory = {
    ...ConfirmDialogStory,
    title: 'UI/Dialogs/Delete',
    component: tagName,
    args: {
        ...ConfirmDialogStory.args,
        id: 'delete',
        title: 'Delete',
        // @ts-ignore - zoneContent is not typed on the ConfirmDialogConfigType, but it is used in the renderDialog function to set the content of the dialog.
        zoneContent: dialogText,
        open: true
    },
    render: args => renderDialog(args, tagName)
};

/** @type {Story} */
export const Default = {
    name: 'Render'
};

/** @type {Story} */
export const Test = {
    parameters: {},
    args: {
        id: 'delete-test'
    },
    play: async context => {
        const { canvasElement, step, args } = context;
        const { dialogNode, dialogsNode } = await playSetup(canvasElement);
        const dialog = within(dialogNode);
        dialogNode.on('confirm', args['@onConfirm']);
        dialogNode.on('cancel', args['@onCancel']);

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

            const cancelButton = dialog.getByRole('button', { name: /cancel/i });
            expect(cancelButton).toBeInTheDocument();
            cancelButton.click();
            await waitFor(() => {
                expect(args['@onCancel']).toHaveBeenCalled();
            });
        });

        await step('Emits confirm event on confirm action', async () => {
            await dialogNode.open();
            const confirmButton = dialog.getByRole('button', { name: /delete/i });
            expect(confirmButton).toBeInTheDocument();
            confirmButton.click();
            await waitFor(() => {
                expect(args['@onConfirm']).toHaveBeenCalled();
            });
        });

        dialogNode.open();
    }
};

export default DeleteDialogStory;
