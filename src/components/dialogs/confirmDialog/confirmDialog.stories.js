/* eslint-disable sonarjs/no-duplicate-string */
import { action } from '@arpadroid/arpadroid/node_modules/@storybook/addon-actions';
import { waitFor, expect, within, fn } from '@storybook/test';
import DialogStory from '../dialog/dialog.stories';
import { renderDialog } from '../dialog/dialogStoryUtil';

const dialogText = 'Are you sure you want to proceed?';

const playSetup = async canvasElement => {
    const canvas = within(canvasElement);
    await customElements.whenDefined('confirm-dialog');
    await customElements.whenDefined('arpa-dialogs');
    const dialogsNode = document.querySelector('arpa-dialogs');
    const dialogNode = document.querySelector('confirm-dialog');
    return { canvas, dialogNode, dialogsNode };
};

const ConfirmDialogStory = {
    ...DialogStory,
    title: 'Dialogs/Confirm',
    args: {
        ...DialogStory.args,
        id: 'confirm',
        variant: 'alert',
        title: 'Confirm Action',
        zoneContent: dialogText,
        open: true,
        onConfirm: fn(() => action('confirm')),
        onCancel: fn(() => action('cancel'))
    },
    argTypes: {
        ...DialogStory.argTypes,
        onConfirm: { table: { category: 'Signals' } },
        onCancel: { table: { category: 'Signals' } }
    },
    render: args => renderDialog(args, 'confirm-dialog')
};

export const Default = {
    name: 'Render',
    parameters: {},
    args: {},
    play: async ({ canvasElement, args }) => {
        const { dialogNode } = await playSetup(canvasElement);
        dialogNode.on('confirm', args.onConfirm);
        dialogNode.on('cancel', args.onCancel);
    }
};

export const Test = {
    parameters: {},
    args: {
        id: 'confirm-test',
        title: 'Confirm Action'
    },
    play: async ({ canvasElement, step, args }) => {
        const { dialogNode, dialogsNode } = await playSetup(canvasElement);
        const dialog = within(dialogNode);
        dialogNode.on('confirm', args.onConfirm);
        dialogNode.on('cancel', args.onCancel);
        dialogNode.setPayload([{ id: 1 }]);
        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);
            console.log('dialogText', dialogText);
            expect(dialog.getByText('Confirm Action')).toBeInTheDocument();
            expect(dialog.getByText(dialogText)).toBeInTheDocument();
            expect(dialog.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
        });

        await step(
            'Clicks on cancel button and expects the dialog to close and cancel signal to be fired.',
            async () => {
                const button = dialog.getByRole('button', { name: /Cancel/i });
                expect(dialogNode).toHaveAttribute('open');
                expect(button).toBeInTheDocument();
                button.click();
                expect(dialogNode).not.toHaveAttribute('open');
                expect(args.onCancel).toHaveBeenCalledTimes(1);
            }
        );

        await step('Reopens the dialog and clicks on confirm button.', async () => {
            dialogNode.open();
            const button = dialog.getByRole('button', { name: /Confirm/i });
            expect(dialogNode).toHaveAttribute('open');
            expect(button).toBeInTheDocument();
            expect(dialogNode).toHaveAttribute('open');
            button.click();
            await waitFor(() => {
                expect(dialogNode).not.toHaveAttribute('open');
                expect(args.onConfirm).toHaveBeenCalledWith([{ id: 1 }], undefined, undefined);
            });
        });
    }
};

export default ConfirmDialogStory;
