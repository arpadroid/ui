/**
 * @typedef {import('./confirmDialog.types.js').ConfirmDialogConfigType} ConfirmDialogConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ConfirmDialogConfigType & {zoneContent?: string}>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ConfirmDialogConfigType>} Story
 * @typedef {import('../dialogs/dialogs').default} Dialogs
 * @typedef {import('./confirmDialog').default} ConfirmDialog
 */
import { waitFor, expect, within, fn, userEvent } from 'storybook/test';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import { $attr } from '@arpadroid/tools';

const dialogText = 'Are you sure you want to proceed?';

const html = String.raw;

const onConfirm = fn();
const onCancel = fn();

/** @type {Meta} */
const ConfirmDialogStory = {
    title: 'UI/Dialogs/Confirm Dialog',
    component: 'confirm-dialog',
    args: {
        id: 'confirm',
        title: 'Confirm Action',
        zoneContent: dialogText,
        open: true
    },
    render: args => {
        return html`
            <arpa-dialogs>
                <confirm-dialog ${$attr(args)}>${dialogText}</confirm-dialog>
            </arpa-dialogs>
        `;
    }
};

/** @type {Story} */
export const Render = {
    parameters: defaultParams
};

/** @type {Story} */
export const Test = {
    parameters: testParams,
    args: {
        id: 'confirm-test'
    },
    play: async ({ step }) => {
        /** @type {Dialogs | null} */
        const dialogsNode = document.querySelector('arpa-dialogs');
        const dialogNode = /** @type {ConfirmDialog} */ (document.querySelector('confirm-dialog'));
        await customElements.whenDefined('arpa-dialogs');
        await dialogNode?.promise;
        const dialog = within(dialogNode);
        dialogNode.setPayload([{ id: 1 }]);
        const cancelButton = await waitFor(() => dialog.getByRole('button', { name: /Cancel/i }));
        dialogNode?.on('confirm', onConfirm);
        dialogNode?.on('cancel', onCancel);

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
                expect(dialogNode).toHaveAttribute('open');
                expect(cancelButton).toBeInTheDocument();
                await new Promise(resolve => setTimeout(resolve, 100));
                await userEvent.click(cancelButton);
                await waitFor(() => expect(dialogNode).not.toHaveAttribute('open'));
                expect(onCancel).toHaveBeenCalledTimes(1);
            }
        );

        await step('Reopens the dialog and clicks on confirm button.', async () => {
            await dialogNode?.open();
            const button = dialog.getByRole('button', { name: /Confirm/i });
            expect(dialogNode).toHaveAttribute('open');
            expect(button).toBeInTheDocument();
            expect(dialogNode).toHaveAttribute('open');
            await userEvent.click(button);
            await waitFor(() => {
                expect(dialogNode).not.toHaveAttribute('open');
                expect(onConfirm).toHaveBeenCalledWith([{ id: 1 }], undefined, undefined);
            });
        });

        dialogNode?.open();
    }
};

export default ConfirmDialogStory;
