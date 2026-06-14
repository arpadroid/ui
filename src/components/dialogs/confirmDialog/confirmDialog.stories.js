/**
 * @typedef {import('./confirmDialog.types.js').ConfirmDialogConfigType} ConfirmDialogConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ConfirmDialogConfigType & {zoneContent?: string}>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ConfirmDialogConfigType>} Story
 * @typedef {import('../dialogs/dialogs').default} Dialogs
 * @typedef {import('../dialog/dialog').default} Dialog
 * @typedef {import('./confirmDialog').default} ConfirmDialog
 */
import { waitFor, expect, within, fn } from 'storybook/test';
import DialogStory from '../dialog/dialog.stories';
import { renderDialog } from '../dialog/dialogStoryUtil';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';

const dialogText = 'Are you sure you want to proceed?';

/**
 * Play setup for the confirm dialog story.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{canvas: any, dialogNode: ConfirmDialog | null, dialogsNode: Dialogs | null}>}
 */
const playSetup = async canvasElement => {
    const canvas = within(canvasElement);
    await customElements.whenDefined('confirm-dialog');
    await customElements.whenDefined('arpa-dialogs');
    /** @type {Dialogs | null} */
    const dialogsNode = document.querySelector('arpa-dialogs');
    /** @type {ConfirmDialog | null} */
    const dialogNode = document.querySelector('confirm-dialog');
    return { canvas, dialogNode, dialogsNode };
};

/** @type {Meta} */
const ConfirmDialogStory = {
    ...DialogStory,
    title: 'UI/Dialogs/Confirm Dialog',
    component: 'confirm-dialog',
    args: {
        ...DialogStory.args,
        id: 'confirm',
        title: 'Confirm Action',
        zoneContent: dialogText,
        open: true,
        '@onConfirm': fn(),
        '@onCancel': fn()
    },
    render: args => renderDialog(args, 'confirm-dialog')
};

/** @type {Story} */
export const Render = {
    parameters: defaultParams
};

/** @type {Story} */
export const Test = {
    parameters: testParams,
    args: {
        id: 'confirm-test',
        title: 'Confirm Action'
    },
    play: async ({ canvasElement, step, args }) => {
        const { dialogNode, dialogsNode } = await playSetup(canvasElement);
        if (!dialogNode || !dialogsNode) {
            throw new Error('Dialog or Dialogs component not found');
        }
        const dialog = within(dialogNode);
        dialogNode?.on('confirm', args['@onConfirm']);
        dialogNode?.on('cancel', args['@onCancel']);
        dialogNode.setPayload([{ id: 1 }]);

        await step('Renders the dialog', async () => {
            expect(dialogsNode).toBeInTheDocument();
            expect(dialogNode).toBeInTheDocument();
            expect(dialogsNode).toContainElement(dialogNode);
            expect(dialog.getByText('Confirm Action')).toBeInTheDocument();
            await waitFor(() => expect(dialog.getByText(dialogText)).toBeDefined());
        });

        await step(
            'Clicks on cancel button and expects the dialog to close and cancel signal to be fired.',
            async () => {
                const button = dialog.getByRole('button', { name: /Cancel/i });
                expect(dialogNode).toHaveAttribute('open');
                expect(button).toBeInTheDocument();
                button.click();
                expect(dialogNode).not.toHaveAttribute('open');
                expect(args['@onCancel']).toHaveBeenCalledTimes(1);
            }
        );

        await step('Reopens the dialog and clicks on confirm button.', async () => {
            await dialogNode?.open();
            const button = dialog.getByRole('button', { name: /Confirm/i });
            expect(dialogNode).toHaveAttribute('open');
            expect(button).toBeInTheDocument();
            expect(dialogNode).toHaveAttribute('open');
            button.click();
            await waitFor(() => {
                expect(dialogNode).not.toHaveAttribute('open');
                expect(args['@onConfirm']).toHaveBeenCalledWith([{ id: 1 }], undefined, undefined);
            });
        });

        dialogNode?.open();
    }
};

export default ConfirmDialogStory;
