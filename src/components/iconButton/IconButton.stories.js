/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */
import { waitFor, expect } from 'storybook/test';
import { playSetup } from './IconButton.stories.util';

/** @type {Meta} */
const ButtonStory = {
    title: 'UI/Buttons/Icon Button',
    tags: [],
    component: 'icon-button',
    args: {
        tooltip: 'Tooltip',
        icon: 'play_arrow',
        tooltipPosition: 'right'
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the icon button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });
    }
};

export default ButtonStory;
