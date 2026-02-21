/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 */
import { expect, within } from 'storybook/test';
import { renderDialog } from '../dialog/dialogStoryUtil';
import ConfirmDialogStory from '../confirmDialog/confirmDialog.stories';
import { playSetup } from './deleteDialog.stories.util';

const dialogText = 'Are you sure you want to delete this item?';
const tagName = 'delete-dialog';

/** @type {Meta} */
const DeleteDialogStory = {
    ...ConfirmDialogStory,
    title: 'UI/Dialogs/Delete',
    args: {
        ...ConfirmDialogStory.args,
        id: 'delete',
        title: 'Delete',
        zoneContent: dialogText,
        open: true
    },
    render: args => renderDialog(args, tagName)
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render'
};

/** @type {StoryObj} */
export const Test = {
    parameters: {},
    args: {
        id: 'delete-test'
    },

    play: async (/** @type {StoryContext} */ context) => {
        const { canvasElement, step, args } = context;
        const { dialogNode, dialogsNode } = await playSetup(canvasElement);
        const dialog = within(dialogNode);
        dialogNode.on('confirm', args.onConfirm);
        dialogNode.on('cancel', args.onCancel);
        // @ts-expect-error
        dialogNode.setPayload([{ id: 1 }]);
        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);
            expect(dialog.getByRole('heading', { name: /Delete/i })).toBeInTheDocument();
            /**
             * @todo - Fix this test, for some reason this is flaky in the pipeline but always passes in the browser.
             */
            // await waitFor(() => {
            //     expect(dialog.getByText('Are you sure you want to delete this item?')).not.toBeNull();
            // });
        });
    }
};

export default DeleteDialogStory;
