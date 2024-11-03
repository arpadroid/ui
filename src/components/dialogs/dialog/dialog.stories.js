import { attrString } from '@arpadroid/tools';
import { action } from '@storybook/addon-actions';
import { waitFor, expect, within, fn } from '@storybook/test';
import { playSetup, renderDialog, dialogText } from './dialogStoryUtil.js';
const html = String.raw;

const category = 'Props';

const DialogStory = {
    title: 'Dialogs/Dialog',
    tags: [],
    args: {
        id: 'dialog',
        title: 'Dialog title',
        open: true,
        onOpen: fn(() => action('open')),
        onClose: fn(() => action('close'))
    },
    argTypes: {
        id: { control: { type: 'text' }, table: { category } },
        title: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        open: { control: { type: 'boolean' }, table: { category } },
        canClose: { control: { type: 'boolean' }, table: { category } },
        zoneTitle: { name: 'title', control: { type: 'text' }, table: { category: 'zones' } },
        zoneContent: { name: 'content', control: { type: 'text' }, table: { category: 'zones' } },
        zoneFooter: { name: 'footer', control: { type: 'text' }, table: { category: 'zones' } },
        onOpen: { table: { category: 'Signals' } },
        onClose: { table: { category: 'Signals' } },
        variant: {
            description: 'The field variant.',
            options: ['primary', 'secondary', 'minimal', 'delete', 'warning'],
            control: { type: 'select' },
            table: { category }
        }
    },
    render: args => renderDialog(args)
};

export const Default = {
    name: 'Render',
    parameters: {},
    args: {}
};

export const Test = {
    parameters: {
        controls: { disable: true }
    },
    args: {
        id: 'dialog-test',
        zoneFooter: 'Footer content'
    },
    play: async ({ canvasElement, step, args }) => {
        const { dialogNode, dialogsNode } = await playSetup(canvasElement);
        const dialog = within(dialogNode);
        dialogNode.on('open', args.onOpen);
        dialogNode.on('close', args.onClose);
        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);

            expect(dialog.getByText('Dialog title')).toBeInTheDocument();
            await waitFor(() => {
                expect(dialog.getByText(dialogText)).toBeInTheDocument();
            });
            expect(dialog.getByText('Footer content')).toBeInTheDocument();
        });

        await step('Closes the dialog', async () => {
            const button = dialog.getByRole('button', { name: 'close' });
            expect(button).toBeInTheDocument();
            button.click();
            expect(dialogNode).not.toHaveAttribute('open');
            expect(dialogNode).not.toBeVisible();
            expect(args.onClose).toHaveBeenCalled();
        });

        await step('Reopens the dialog', async () => {
            dialogNode.open();
            expect(dialogNode).toHaveAttribute('open');
            expect(args.onOpen).toHaveBeenCalled();
        });
    }
};

export const ButtonDialog = {
    parameters: {},
    args: {
        id: 'button-dialog',
        open: false
    },
    render: args => {
        return html` <arpa-dialogs id="button-dialogs"></arpa-dialogs>
            <button is="arpa-button" variant="primary" id="openDialog">
                Open Dialog
                <arpa-dialog dialogs-id="button-dialogs" ${attrString(args)}>
                    <zone name="title"> Button Dialog </zone>
                    <zone name="content">
                        Adding a dialog inside a button will automatically open the dialog when the button is
                        clicked. The dialog doesn't physically exist inside the button, but it is appended to
                        the dialogs component. <br />See the usage panel for more information.
                    </zone>
                </arpa-dialog>
            </button>`;
    }
};

export const ButtonDialogTest = {
    ...ButtonDialog,
    args: {
        id: 'button-dialog-test',
        open: false
    },
    play: async ({ canvasElement, step }) => {
        const { dialogNode, canvas } = await playSetup(canvasElement);

        await step('Clicks on the button and opens the dialog', async () => {
            const button = canvas.getByRole('button', { name: /Open Dialog/i });
            expect(dialogNode).not.toHaveAttribute('open');
            button.click();
            await waitFor(() => expect(dialogNode).toHaveAttribute('open'));
        });
    }
};

export default DialogStory;
