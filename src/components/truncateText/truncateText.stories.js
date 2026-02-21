/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect } from 'storybook/test';
import { getArgTypes, playSetup } from './truncateText.stories.util.js';
const html = String.raw;
/** @type {Meta} */
const TruncateTextStory = {
    title: 'UI/Components/Truncate Text',
    tags: [],
    args: {
        maxLength: 40,
        text: 'In the vast expanse of the cosmos, stars are born from clouds of dust, only to collapse and scatter that dust again when they die. Every atom in your body was forged in the heart of a dying star, millions of years before the Earth existed. Yet here you are, a collection of star-stuff, capable of looking up at the night sky and wondering about your origins. The universe is as much within you as it is outside of you.'
    },
    argTypes: getArgTypes(),
    render: args => {
        return html`<truncate-text ${attrString(args)}>${args.text}</truncate-text>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: getArgTypes(),
    args: TruncateTextStory.args,
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { truncateTextNode } = setup;
        await step('Renders the truncate text component.', async () => {
            await waitFor(() => expect(truncateTextNode).not.toBeNull());
            expect(truncateTextNode.textContent).toContain('In the vast expanse of the cosmos, stars');
        });
    }
};

export default TruncateTextStory;
