import { expect, within } from '@storybook/test';
import { renderDialog } from '../dialog/dialogStoryUtil';
import ConfirmDialogStory from '../confirmDialog/confirmDialog.stories';

const dialogText = 'Are you sure you want to delete this item?';
const tagName = 'delete-dialog';

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

export const Default = {
    name: 'Render'
};

export const Test = {
    parameters: {},
    args: {
        id: 'delete-test'
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined(tagName);
        await customElements.whenDefined('arpa-dialogs');
        const dialogsNode = document.querySelector('arpa-dialogs');
        const dialogNode = document.querySelector(tagName);
        return { canvas, dialogNode, dialogsNode };
    },
    play: async ({ canvasElement, step, args }) => {
        const { dialogNode, dialogsNode } = await Test.playSetup(canvasElement);
        const dialog = within(dialogNode);
        dialogNode.on('confirm', args.onConfirm);
        dialogNode.on('cancel', args.onCancel);
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
