/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 *
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
import { getArgTypes, playSetup } from './dropArea.stories.utils';
const html = String.raw;
/** @type {Meta} */
const DropAreaStory = {
    title: 'UI/Components/Drop Area',
    tags: [],
    parameters: {
        layout: 'padded'
    },
    render: (/** @type {Record<string, unknown>} */ args) => {
        return html`<drop-area ${attrString(args)}></drop-area>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: getArgTypes(),
    args: getArgTypes(),

    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { dropAreaNode } = setup;
        await step('renders the drop area', async () => {
            await waitFor(() => expect(dropAreaNode).not.toBeNull());
        });
    }
};

export default DropAreaStory;
