/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
const html = String.raw;
/** @type {Meta} */
const ButtonStory = {
    title: 'UI/Buttons/Icon Button',
    tags: [],
    getArgs: () => ({ variant: 'primary', icon: 'play_arrow', label: 'Click me!', tooltipPosition: 'right' }),
    getArgTypes: (category = 'IconButton Props') => ({
        icon: { control: { type: 'text' }, table: { category } },
        tooltipPosition: {
            control: { type: 'select' },
            options: ['top', 'bottom', 'left', 'right'],
            table: { category }
        },
        variant: {
            description: 'The field variant.',
            options: ['primary', 'secondary', 'tertiary', 'danger', 'warning'],
            control: { type: 'select' },
            table: { category }
        }
    }),
    render: (/** @type {Record<string, unknown>} */ args) => {
        return html`<icon-button ${attrString(args)}></icon-button>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: ButtonStory.getArgTypes(),
    args: ButtonStory.getArgs(),
    /**
     * @param {HTMLElement} canvasElement
     */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-button');
        const buttonNode = canvasElement.querySelector('button');
        return { canvas, buttonNode };
    },
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the icon button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });
    }
};

export default ButtonStory;
