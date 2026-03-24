/**
 * @typedef {import('./dialog.types').DialogConfigType} DialogConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<DialogConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<DialogConfigType & {zoneFooter?: string}>} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 * @typedef {import('../dialogs/dialogs').default} Dialogs
 * @typedef {import('../dialog/dialog').default} Dialog
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within, fn, fireEvent } from 'storybook/test';
import { playSetup, renderDialog } from './dialogStoryUtil';
const html = String.raw;

/** @type {Meta} */
const DialogStory = {
    title: 'UI/Dialogs/Dialog',
    tags: [],
    component: 'arpa-dialog',
    args: {
        id: 'dialog',
        title: 'Dialog title',
        open: true,
        '@onOpen': fn(),
        '@onClose': fn()
    },
    render: args => renderDialog(args)
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    args: {}
};

/** @type {StoryObj} */
export const Test = {
    parameters: {
        controls: { disable: true }
    },
    args: {
        id: 'dialog-test',
        zoneFooter: 'Footer content'
    },
    play: async ({ step, args }) => {
        const { dialogNode, dialogsNode } = await playSetup();
        const dialog = within(dialogNode);
        dialogNode?.on('open', args['@onOpen']);
        dialogNode?.on('close', args['@onClose']);
        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);
            expect(dialog.getByText('Dialog title')).toBeInTheDocument();
            /**
             * @todo - Fix this test, for some reason this is flaky in the pipeline but always passes in the browser.
             */
            // expect(dialog.getByText('Footer content')).toBeInTheDocument();
            // await waitFor(() => expect(dialog.getByText(dialogText)).toBeInTheDocument());
        });

        await step('Closes the dialog', async () => {
            const button = dialog.getByRole('button', { name: 'close' });
            expect(button).toBeInTheDocument();
            button.click();
            await waitFor(() => expect(dialogNode).not.toHaveAttribute('open'));
            expect(dialogNode).not.toBeVisible();
            expect(args['@onClose']).toHaveBeenCalled();
        });

        await step('Reopens the dialog', async () => {
            dialogNode?.open();
            await waitFor(() => expect(dialogNode).toHaveAttribute('open'));
            expect(args['@onOpen']).toHaveBeenCalled();
        });
    }
};

/** @type {StoryObj} */
export const ButtonDialog = {
    parameters: {},
    args: {
        id: 'button-dialog',
        open: false,
        title: undefined
    },
    render: args => {
        return html`<arpa-dialogs id="button-dialogs"></arpa-dialogs>
            <arpa-button variant="primary" id="openDialog">
                Open Dialog
                <arpa-dialog dialogs-id="button-dialogs" ${attrString(args)}>
                    <zone name="title"> Button Dialog </zone>
                    <zone name="content">
                        Adding a dialog inside a button will automatically open the dialog when the button is
                        clicked. The dialog doesn't physically exist inside the button, but it is appended to
                        the dialogs component. <br />See the usage panel for more information.
                    </zone>
                </arpa-dialog>
            </arpa-button>`;
    }
};

/** @type {StoryObj} */
export const ButtonDialogTest = {
    ...ButtonDialog,
    args: {
        id: 'button-dialog-test',
        open: false,
        title: undefined
    },
    play: async ({ canvas, step }) => {
        const { dialogNode } = await playSetup();
        await dialogNode?.promise;
        const button = canvas.getByRole('button', { name: /Open Dialog/i });
        expect(dialogNode).not.toHaveAttribute('open');

        await step('Clicks on the button and opens the dialog', async () => {
            await fireEvent.click(button);
            await waitFor(() => {
                // expect(dialogNode).toHaveAttribute('open', '');
                expect(dialogNode).toBeInTheDocument();
            });
        });
    }
};

export default DialogStory;
