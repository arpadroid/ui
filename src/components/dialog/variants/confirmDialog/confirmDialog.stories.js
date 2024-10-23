import { attrString } from '@arpadroid/tools';
import { action } from '@storybook/addon-actions';
import { waitFor, expect, within, fn } from '@storybook/test';
const html = String.raw;

const onConfirm = fn(() => action('confirm'));
const onCancel = fn(() => action('cancel'));

// eslint-disable-next-line quotes
const dialogText = `Are you sure you want to delete this item?`;

const dialog = args => {
    const content = args.content || dialogText;
    delete args.content;
    return html`
        <arpa-dialogs>
            <confirm-dialog ${attrString(args)}>
                <zone name="content">${content}</zone>
            </confirm-dialog>
        </arpa-dialogs>
    `;
};

const ConfirmDialogStory = {
    title: 'Components/Dialog/Confirm',
    tags: [],
    args: {
        id: 'confirm',
        variant: 'primary',
        open: true,
        content: html`${dialogText}`
    },
    getArgTypes: (category = 'Dialog Props') => ({
        title: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        variant: {
            description: 'The field variant.',
            options: ['primary', 'secondary', 'minimal', 'delete', 'warning'],
            control: { type: 'select' },
            table: { category }
        }
    }),
    render: args => dialog(args)
};

export const Default = {
    name: 'Render',
    parameters: {},
    args: {}
};

export const Test = {
    parameters: {},
    args: {
        id: 'confirm-test'
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('confirm-dialog');
        await customElements.whenDefined('arpa-dialogs');
        const dialogsNode = document.querySelector('arpa-dialogs');
        const dialogNode = document.querySelector('confirm-dialog');

        return { canvas, dialogNode, dialogsNode };
    },
    play: async ({ canvasElement, step }) => {
        const { dialogNode, dialogsNode } = await Test.playSetup(canvasElement);
        const dialog = within(dialogNode);
        dialogNode.on('confirm', onConfirm);
        dialogNode.on('cancel', onCancel);
        dialogNode.setPayload([{ id: 1 }]);
        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);
            console.log('dialogText', dialogText);
            expect(dialog.getByText('Confirm Action')).toBeInTheDocument();
            expect(dialog.getByText(dialogText)).toBeInTheDocument();
            expect(dialog.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
        });

        await step(
            'Clicks on cancel button and expects the dialog to close and cancel signal to be fired.',
            async () => {
                const button = dialog.getByRole('button', { name: /Cancel/i });
                expect(dialogNode).toHaveAttribute('open');
                expect(button).toBeInTheDocument();
                button.click();
                expect(dialogNode).not.toHaveAttribute('open');
                expect(onCancel).toHaveBeenCalledTimes(1);
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
                expect(onConfirm).toHaveBeenCalledWith([{ id: 1 }], undefined, undefined);
            });
        });
    }
};

export default ConfirmDialogStory;
