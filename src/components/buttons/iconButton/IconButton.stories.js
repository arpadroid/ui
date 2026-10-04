/**
 * @typedef {import('./iconButton.types.js').IconButtonConfigType} IconButtonConfigType
 * @typedef {import('./iconButton').default} IconButton
 * @typedef {import('@storybook/web-components-vite').Meta<IconButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<IconButtonConfigType>} Story
 */

import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

/** @type {Meta} */
const ButtonStory = {
    title: 'UI/Buttons/Icon Button',
    tags: [],
    component: 'icon-button',
    args: {
        tooltip: 'Play',
        icon: 'play_arrow',
        tooltipPosition: 'right'
    }
};

/** @type {Story} */
export const Default = {
    name: 'Render',
    parameters: defaultParams
};

/** @type {Story} */
export const Test = {
    args: {
        tooltip: 'Test tooltip',
        icon: 'labs'
    },
    parameters: testParams,
    play: async ({ canvas, canvasElement, step }) => {
        const onClickAction = fn(() => {});
        const arpaButton = /** @type {IconButton} */ (canvasElement.querySelector('icon-button'));
        await arpaButton.promise;
        const button = /** @type {HTMLButtonElement} */ (canvas.getByRole('button', { name: /test/i }));
        arpaButton.setConfig({ onClick: onClickAction });

        await step('calls the onClick action when clicked', async () => {
            await userEvent.click(button);
            await waitFor(() => {
                expect(onClickAction).toHaveBeenCalled();
                expect(canvas.getByText(/test tooltip/i)).toBeVisible();
            });
        });
    }
};

/** @type {Story} */
export const Disabled = {
    args: {
        variant: 'disabled',
        tooltip: 'Disabled Button'
    },
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        const onClickAction = fn(() => {});
        const button = await waitFor(() => canvas.getByRole('button'));
        const arpaButton = /** @type {IconButton} */ (canvasElement.querySelector('icon-button'));
        arpaButton.setConfig({ onClick: onClickAction });
        await step('renders the disabled icon button', async () => {
            await waitFor(() => {
                expect(button).toHaveAttribute('disabled');
            });
        });

        await step('does not call the onClick action when clicked', async () => {
            button && (await userEvent.click(button));
            expect(onClickAction).not.toHaveBeenCalled();
        });
    }
};

export default ButtonStory;
