/* eslint-disable sonarjs/no-duplicate-string */
/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 * @typedef {import('../dialogs/dialogs').default} Dialogs
 * @typedef {import('../dialog/dialog').default} Dialog
 * @typedef {import('./confirmDialog').default} ConfirmDialog
 */
import { waitFor, expect, within, fn } from 'storybook/test';
import DialogStory from '../dialog/dialog.stories';
import { renderDialog } from '../dialog/dialogStoryUtil';


const dialogText = 'Are you sure you want to proceed?';

/**
 * @param {HTMLElement} canvasElement
 */
const playSetup = async canvasElement => {
    const canvas = within(canvasElement);
    await customElements.whenDefined('confirm-dialog');
    await customElements.whenDefined('arpa-dialogs');
    
    const dialogsNode = /** @type {Dialogs} */ (document.querySelector('arpa-dialogs'));
    const dialogNode = /** @type {ConfirmDialog} */ (document.querySelector('confirm-dialog'));
    return { canvas, dialogNode, dialogsNode };
};

/** @type {Meta} */
const ConfirmDialogStory = {
    ...DialogStory,
    title: 'UI/Dialogs/Confirm',
    args: {
        ...DialogStory.args,
        id: 'confirm',
        title: 'Confirm Action',
        zoneContent: dialogText,
        open: true,
        onConfirm: fn(),
        onCancel: fn()
    },
    argTypes: {
        ...DialogStory.argTypes,
        onConfirm: { table: { category: 'Signals' } },
        onCancel: { table: { category: 'Signals' } }
    },
    render: (/** @type {Args} */ args) => renderDialog(args, 'confirm-dialog')
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    args: {},
    play: async (/** @type {StoryContext} */ { canvasElement, args }) => {
        const { dialogNode } = await playSetup(canvasElement);
        dialogNode?.on('confirm', args.onConfirm);
        dialogNode?.on('cancel', args.onCancel);
    }
};

/** @type {StoryObj} */
export const Test = {
    parameters: {},
    args: {
        id: 'confirm-test',
        title: 'Confirm Action'
    },
    play: async (/** @type {StoryContext} */ { canvasElement, step, args }) => {
        const { dialogNode, dialogsNode } = await playSetup(canvasElement);
        const dialog = within(dialogNode);
        dialogNode.on('confirm', args.onConfirm);
        dialogNode.on('cancel', args.onCancel);
        // @ts-ignore
        dialogNode.setPayload([{ id: 1 }]);

        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);
            expect(dialog.getByText('Confirm Action')).toBeInTheDocument();
            /**
             * @todo - Fix this test, for some reason this is flaky in the pipeline but always passes in the browser.
             */
            // await waitFor(() => expect(dialog.getByText(dialogText)).toBeDefined());
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
