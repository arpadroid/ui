/**
 * @typedef {import('./dialog.types').DialogConfigType} DialogConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<DialogConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<DialogConfigType & {zoneFooter?: string}>} Story
 * @typedef {import('../dialogs/dialogs').default} Dialogs
 * @typedef {import('../dialog/dialog').default} Dialog
 * @typedef {import('../../buttons/button/button').default} Button
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within, fn, userEvent } from 'storybook/test';
const html = String.raw;

const onClose = fn();
const onOpen = fn();

const content =
    'In the depths of the ocean, scientists discovered an ancient ecosystem thriving around hydrothermal vents. These towering underwater chimneys spew hot, mineral-rich water, supporting unique life forms—giant tube worms, ghostly shrimp, and bacteria that convert chemicals into energy. This alien-like world, hidden beneath miles of water, may hold secrets to understanding life beyond Earth.';

/** @type {Meta} */
const DialogStory = {
    title: 'UI/Dialogs/Dialog',
    tags: [],
    component: 'arpa-dialog',
    parameters: {
        layout: 'centered'
    },
    beforeEach: async ({ canvasElement }) => canvasElement.querySelector('arpa-dialogs')?.remove(),
    args: {
        id: 'dialog',
        title: 'Beneath miles of water',
        icon: 'waves',
        container: '#storybook-root',
        open: true
    },
    render: args => {
        return html`
            <arpa-dialog ${attrString(args)}>
                <arpa-zone name="content">${content}</arpa-zone>
                <arpa-zone name="footer">
                    <nav-link link="javascript:void(0)"> <arpa-icon>link</arpa-icon> Find out more </nav-link>
                </arpa-zone>
            </arpa-dialog>
        `;
    }
};

/** @type {Story} */
export const Default = {
    name: 'Render',
    parameters: {},
    args: {}
};

/** @type {Story} */
export const Test = {
    parameters: {
        controls: { disable: true }
    },
    args: {
        container: '#storybook-root',
        title: 'Beneath miles of water',
        id: 'dialog-test'
    },
    play: async ({ step, args, canvasElement }) => {
        const { title = '' } = args;

        const dialogNode = /** @type {Dialog} */ (canvasElement.querySelector('arpa-dialog'));
        await dialogNode.promise;
        const dialog = within(dialogNode);
        dialogNode?.on('open', onOpen);
        dialogNode?.on('close', onClose);

        await step('Renders the dialog', async () => {
            await waitFor(() => {
                expect(dialogNode.parentElement?.tagName).toBe('ARPA-DIALOGS');
                expect(dialog.getByText(title)).toBeVisible();
                expect(dialog.getByText(content, { exact: false })).toBeInTheDocument();
                expect(dialog.getByText('Find out more')).toBeInTheDocument();
            });
        });

        await step('Closes the dialog', async () => {
            const button = dialog.getByRole('button', { name: 'close' });
            expect(button).toBeInTheDocument();
            await userEvent.click(button);
            await waitFor(() => expect(dialogNode).not.toHaveAttribute('open'));
            expect(dialogNode).not.toBeVisible();
            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });

        await step('Reopens the dialog', async () => {
            await dialogNode?.open();
            await waitFor(() => expect(dialogNode).toHaveAttribute('open'));
            expect(onOpen).toHaveBeenCalled();
        });

        await step('Closes the dialog with Escape key', async () => {
            await userEvent.keyboard('{Escape}');
            await waitFor(() => expect(dialogNode).not.toHaveAttribute('open'));
            expect(dialogNode).not.toBeVisible();
            await waitFor(() => {
                expect(onClose).toHaveBeenCalled();
            });
        });

        await dialogNode?.open();
    }
};

/** @type {Story} */
export const ButtonDialog = {
    parameters: {},
    args: {
        id: 'button-dialog',
        open: false,
        title: undefined
    },
    render: args => {
        return html`
            <arpa-button variant="primary" id="openDialog">
                Open Dialog
                <arpa-dialog dialogs-id="button-dialogs" ${attrString(args)}>
                    <arpa-zone name="title"> Button Dialog </arpa-zone>
                    <arpa-zone name="content">
                        Adding a dialog inside a button will automatically open the dialog when the button is
                        clicked. The dialog doesn't physically exist inside the button, but it is appended to
                        the dialogs component. <br />See the usage panel for more information.
                    </arpa-zone>
                </arpa-dialog>
            </arpa-button>
        `;
    },
    play: async ({ canvas, step, canvasElement }) => {
        const button = canvas.getByRole('button', { name: /Open Dialog/i });
        expect(button).toBeInTheDocument();
        await waitFor(() => {
            const dialogNode = /** @type {Dialog} */ (canvasElement.querySelector('arpa-dialog'));
            expect(dialogNode).toBeInTheDocument();
        });
        const dialogNode = /** @type {Dialog} */ (canvasElement.querySelector('arpa-dialog'));
        await dialogNode.promise;
        expect(dialogNode).not.toHaveAttribute('open');
        await step('Clicks on the button and opens the dialog', async () => {
            await userEvent.click(button);
            await waitFor(() => {
                expect(dialogNode).toHaveAttribute('open');
            });
        });
    }
};

export default DialogStory;
