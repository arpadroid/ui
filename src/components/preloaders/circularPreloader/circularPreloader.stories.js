/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
import { getArgs, getArgTypes, playSetup } from './circularPreloader.stories.util';
const html = String.raw;
/** @type {Meta} */
const CircularPreloaderStory = {
    title: 'UI/Preloaders/Circular Preloader',
    tags: [],
    render: (/** @type {Record<string, unknown>} */ args) => {
        return html`<circular-preloader ${attrString(args)}>${args.content}</circular-preloader>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: getArgTypes(),
    args: getArgs()
};

/** @type {StoryObj} */
export const Test = {
    ...Default,
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { preloader } = setup;
        await step('renders the circular preloader text', async () => {
            await waitFor(() => expect(preloader).not.toBeNull());
        });
    }
};

export default CircularPreloaderStory;
