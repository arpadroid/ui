import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;

// eslint-disable-next-line quotes
const dialogText = `In the depths of the ocean, scientists discovered an ancient ecosystem thriving around hydrothermal vents. These towering underwater chimneys spew hot, mineral-rich water, supporting unique life forms—giant tube worms, ghostly shrimp, and bacteria that convert chemicals into energy. This alien-like world, hidden beneath miles of water, may hold secrets to understanding life beyond Earth.`;

const dialog = args => html`<arpa-dialog ${attrString(args)}>
    <zone name="header"> </zone>
    <zone name="children"> ${dialogText} </zone>
    <zone name="footer"> some footer </zone>
</arpa-dialog>`;

const DialogStory = {
    title: 'Components/Dialog',
    tags: [],
    args: {
        title: 'Dialog Title',
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
    parameters: {},
    args: {},
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-dialog');
        await customElements.whenDefined('arpa-dialogs');
        const dialogsNode = document.querySelector('arpa-dialogs');
        const dialogNode = document.querySelector('arpa-dialog');

        return { canvas, dialogNode, dialogsNode };
    },
    play: async ({ canvasElement, step }) => {
        const { dialogNode, dialogsNode } = await Test.playSetup(canvasElement);
        const dialog = within(dialogNode);
        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);

            expect(dialog.getByText('Dialog Title')).toBeInTheDocument();
            expect(dialog.getByText(dialogText)).toBeInTheDocument();
            expect(dialog.getByText('some footer')).toBeInTheDocument();
        });

        await step('Closes the dialog', async () => {
            const button = dialog.getByRole('button', { name: 'close' });
            expect(button).toBeInTheDocument();
            button.click();
            expect(dialogNode).not.toHaveAttribute('open');
            expect(dialogNode).not.toBeVisible();
        });
    }
};

export const ButtonDialog = {
    parameters: {},
    args: {
        open: false
    },
    render: args => {
        return html`<button is="arpa-button" variant="primary" id="openDialog">
            Open Dialog ${dialog(args)}
        </button>`;
    },
    play: async ({ canvasElement, step }) => {
        const { dialogNode, canvas } = await Test.playSetup(canvasElement);

        await step('Clicks on the button and opens the dialog', async () => {
            const button = canvas.getByRole('button', { name: /Open Dialog/i });
            expect(dialogNode).not.toHaveAttribute('open');
            button.click();
            await waitFor(() => expect(dialogNode).toHaveAttribute('open'));
        });
    }
};

export default DialogStory;
