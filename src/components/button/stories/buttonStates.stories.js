/**
 * @typedef {import('../button').default} Button
 * @typedef {import('../button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} ButtonMetaStatesMetaType
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} ButtonStatesStoryType
 */

import { expect } from 'storybook/test';
import { playSetup } from '../stories/button.stories.util';
import ButtonStory from './button.stories';

/** @type {ButtonMetaStatesMetaType} */
const ButtonStatesStory = {
    ...ButtonStory,
    title: 'UI/Buttons/Button/States'
};

/** @type {ButtonStatesStoryType} */
export const Disabled = {
    args: {
        disabled: true,
        content: 'Disabled Button'
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the button', async () => {
            expect(buttonNode).not.toBeNull();
        });
    }
};

/** @type {ButtonStatesStoryType} */
export const Focused = {
    args: {
        content: 'Focused Button'
    },
    play: async ({ canvas }) => {
        const button = canvas.getByRole('button');
        button.focus();
    }
};

export default ButtonStatesStory;
