/**
 * @typedef {import('./iconButton.types.js').IconButtonConfigType} IconButtonConfigType
 * @typedef {import('../button/button').default} Button
 * @typedef {import('../button/button.types.js').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 */

import { expect, fn, userEvent } from 'storybook/test';
import { playSetup } from './IconButton.stories.util';

const onClickAction = fn(() => {});

/** @type {Meta} */
const ButtonStory = {
    title: 'UI/Buttons/Icon Button',
    tags: [],
    component: 'icon-button',
    args: {
        tooltip: 'Play',
        icon: 'play_arrow',
        tooltipPosition: 'right',
        '@onClick': onClickAction
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    play: async ({ canvasElement, canvas, step }) => {
        await playSetup(canvasElement);
        const button = canvas.getByRole('button', { name: /play/i });
        await step('renders the icon button', async () => {
            expect(button).toBeInTheDocument();
        });
    }
};

/** @type {StoryObj} */
export const Test = {
    args: {
        tooltip: 'Test tooltip',
        icon: 'labs'
    },
    play: async ({ canvas, step }) => {
        const button = canvas.getByRole('button', { name: /test/i });

        await step('calls the onClick action when clicked', async () => {
            await userEvent.click(button);
            expect(onClickAction).toHaveBeenCalledOnce();
            expect(canvas.getByText(/test/i)).toBeVisible();
        });
    }
};

/** @type {StoryObj} */
export const Disabled = {
    args: {
        variant: 'disabled',
        tooltip: 'Disabled Button'
    },
    play: async ({ canvas, step }) => {
        const button = canvas.getByRole('button', { name: /Disabled Button/i });
        await step('renders the disabled icon button', async () => {
            expect(button).toBeDisabled();
        });

        await step('does not call the onClick action when clicked', async () => {
            await userEvent.click(button);
            expect(onClickAction).not.toHaveBeenCalled();
        });
    }
};

export default ButtonStory;
