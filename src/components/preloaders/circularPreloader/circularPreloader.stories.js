/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
const html = String.raw;
/** @type {Meta} */
const CircularPreloaderStory = {
    title: 'UI/Preloaders/Circular Preloader',
    tags: [],
    getArgs: () => ({
        text: '',
        content: ''
    }),
    getArgTypes: (category = 'Circular Preloader Props') => ({
        size: {
            control: { type: 'select' },
            options: ['mini', 'small', 'medium', 'big'],
            table: { category }
        },
        variant: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'tertiary'],
            table: { category }
        },
        text: { control: { type: 'text' }, table: { category } },
        content: { control: { type: 'text' }, table: { category: 'Content' } }
    }),
    render: (/** @type {Record<string, unknown>} */ args) => {
        return html`<circular-preloader ${attrString(args)}>${args.content}</circular-preloader>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: CircularPreloaderStory.getArgTypes(),
    args: CircularPreloaderStory.getArgs()
};

/** @type {StoryObj} */
export const Test = {
    ...Default,
    /**
     * @param {HTMLElement} canvasElement
     */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('truncate-text');
        const preloader = canvasElement.querySelector('circular-preloader');
        return { canvas, preloader };
    },
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { preloader } = setup;
        await step('renders the circular preloader text', async () => {
            await waitFor(() => expect(preloader).not.toBeNull());
        });
    }
};

export default CircularPreloaderStory;
