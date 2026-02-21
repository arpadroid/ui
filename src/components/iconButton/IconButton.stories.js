/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect } from 'storybook/test';
import { getArgs, getArgTypes, playSetup } from './IconButton.stories.util';
const html = String.raw;
/** @type {Meta} */
const ButtonStory = {
    title: 'UI/Buttons/Icon Button',
    tags: [],
    render: (/** @type {Record<string, unknown>} */ args) => {
        return html`<icon-button ${attrString(args)}></icon-button>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: getArgTypes(),
    args: getArgs(),
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the icon button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });
    }
};

export default ButtonStory;
