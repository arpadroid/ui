/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
const html = String.raw;
/** @type {Meta} */
const IconStory = {
    title: 'UI/Components/Icon',
    tags: [],
    getArgs: () => ({ icon: 'sailing' }),
    getArgTypes: (category = 'Icon Props') => ({
        icon: { control: { type: 'text' }, table: { category } }
    }),
    render: (/** @type {Record<string, unknown>} */ args) => {
        const icon = args.icon;
        delete args.icon;
        return html`<arpa-icon ${attrString(args)}>${icon}</arpa-icon>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: IconStory.getArgTypes(),
    args: IconStory.getArgs(),
    /**
     * @param {HTMLElement} canvasElement
     */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-icon');
        const iconNode = canvasElement.querySelector('arpa-icon');
        return { canvas, iconNode };
    },
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { iconNode } = setup;
        const { icon } = Default.args;
        iconNode.icon = icon;

        await step('renders the icon', async () => {
            await waitFor(() => expect(iconNode).not.toBeNull());
        });
    }
};

export default IconStory;
