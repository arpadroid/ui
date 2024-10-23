import { attrString } from '@arpadroid/tools';
import { action } from '@storybook/addon-actions';
import { waitFor, expect, within, fn } from '@storybook/test';
const html = String.raw;

// eslint-disable-next-line quotes
const dialogText = `In the depths of the ocean, scientists discovered an ancient ecosystem thriving around hydrothermal vents. These towering underwater chimneys spew hot, mineral-rich water, supporting unique life forms—giant tube worms, ghostly shrimp, and bacteria that convert chemicals into energy. This alien-like world, hidden beneath miles of water, may hold secrets to understanding life beyond Earth.`;

const dialog = args => html`
    <arpa-dialogs>
        <arpa-dialog ${attrString(args)}>
            <zone name="title"> Dialog title </zone>
            <zone name="content"> ${dialogText} </zone>
            <zone name="footer">Dialog footer content</zone>
        </arpa-dialog>
    </arpa-dialogs>
`;

const playSetup = async canvasElement => {
    const canvas = within(canvasElement);
    await customElements.whenDefined('arpa-dialog');
    await customElements.whenDefined('arpa-dialogs');
    const dialogsNode = document.querySelector('arpa-dialogs');
    const dialogNode = document.querySelector('arpa-dialog');
    const onOpen = fn(() => action('open'));
    const onClose = fn(() => action('close'));
    dialogNode.on('open', onOpen);
    dialogNode.on('close', onClose);
    return { canvas, dialogNode, dialogsNode, onOpen, onClose };
};

const DialogStory = {
    title: 'Components/Dialog/Dialog',
    tags: [],
    args: {
        id: 'dialog',
        icon: 'dialogs',
        variant: 'primary',
        open: true
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
    parameters: {
        controls: { disable: true }
    },
    args: {
        id: 'dialog-test'
    },
    play: async ({ canvasElement, step }) => {
        const { dialogNode, dialogsNode, onOpen, onClose } = await playSetup(canvasElement);
        const dialog = within(dialogNode);
        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);

            expect(dialog.getByText('Dialog title')).toBeInTheDocument();
            expect(dialog.getByText(dialogText)).toBeInTheDocument();
            expect(dialog.getByText('Dialog footer content')).toBeInTheDocument();
        });

        await step('Closes the dialog', async () => {
            const button = dialog.getByRole('button', { name: 'close' });
            expect(button).toBeInTheDocument();
            button.click();
            expect(dialogNode).not.toHaveAttribute('open');
            expect(dialogNode).not.toBeVisible();
            expect(onClose).toHaveBeenCalled();
        });

        await step('Reopens the dialog', async () => {
            dialogNode.open();
            expect(dialogNode).toHaveAttribute('open');
            expect(onOpen).toHaveBeenCalled();
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
