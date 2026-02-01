/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 *
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
const html = String.raw;
/** @type {Meta} */
const DropAreaStory = {
    title: 'UI/Components/Drop Area',
    tags: [],
    parameters: {
        layout: 'padded'
    },
    getArgs: () => ({}),
    getArgTypes: (category = 'DropArea Props') => ({
        hasInput: { control: { type: 'boolean' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        label: { control: { type: 'text' }, table: { category } }
    }),
    render: (/** @type {Record<string, unknown>} */ args) => {
        return html`<drop-area ${attrString(args)}></drop-area>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: DropAreaStory.getArgTypes(),
    args: DropAreaStory.getArgs(),
    /**
     * @param {HTMLElement} canvasElement
     */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('drop-area');
        const dropAreaNode = canvasElement.querySelector('drop-area');
        return { canvas, dropAreaNode };
    },
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { dropAreaNode } = setup;
        await step('renders the drop area', async () => {
            await waitFor(() => expect(dropAreaNode).not.toBeNull());
        });
    }
};

export default DropAreaStory;
