/**
 * @typedef {import('../button.js').default} Button
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 */

import { expect } from 'storybook/test';
import { playSetup } from '../stories/button.stories.util';
import ButtonStory, { Default } from './button.stories';

/** @type {Meta} */
const ButtonVariantsStory = {
    title: 'UI/Buttons/Button/Variants',
    render: ButtonStory.render
};

/** @type {StoryObj} */
export const VariantDelete = {
    args: { ...Default.args, variant: 'delete', content: 'Delete Button', icon: undefined }
};

/** @type {StoryObj} */
export const VariantDisabled = {
    args: { ...Default.args, disabled: true, content: 'Disabled Button' },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the button', async () => {
            expect(buttonNode).not.toBeNull();
        });
    }
};

export default ButtonVariantsStory;
