/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
const html = String.raw;
/** @type {Meta} */
const TooltipStory = {
    title: 'UI/Components/Tooltip',
    tags: [],
    getArgTypes: (category = 'Tooltip Props') => ({
        text: { control: { type: 'text' }, table: { category } },
        handler: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        label: { control: { type: 'text' }, table: { category } },
        position: {
            control: { type: 'select' },
            options: ['top', 'right', 'bottom', 'left'],
            table: { category }
        }
    })
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: TooltipStory.getArgTypes(),
    args: {
        text: 'This is some informative tooltip text.',
        handler: 'Hover over me',
        icon: 'info',
        label: '',
        position: 'top'
    },
    render: (/** @type {Args} */ args) => html` <arpa-tooltip ${attrString(args)}> </arpa-tooltip> `
};

/** @type {StoryObj} */
export const Test = {
    ...Default,
    name: 'Test',
    /**
     * @param {HTMLElement} canvasElement
     */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-tooltip');
        const tooltipNode = canvasElement.querySelector('arpa-tooltip');
        return { canvas, tooltipNode };
    },
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { tooltipNode } = setup;
        await step('renders the tooltip', async () => {
            await waitFor(() => expect(tooltipNode).not.toBeNull());
            expect(tooltipNode).toBeDefined();
        });
    }
};

/** @type {StoryObj} */
export const Zoned = {
    name: 'Zoned Content',
    parameters: {},
    argTypes: {
        ...TooltipStory.getArgTypes(),
        content: { control: { type: 'text' }, table: { category: 'zones' } },
        handler: { control: { type: 'text' }, table: { category: 'zones' } }
    },
    args: {
        handler: '',
        content: 'This is some informative tooltip text.'
    },
    render: (/** @type {Args} */ args) => {
        return html`
            <arpa-tooltip ${attrString(args)}>
                <zone name="handler"><arpa-icon>info</arpa-icon>${args.handler}</zone>
                <zone name="tooltip-content">${args.content}</zone>
            </arpa-tooltip>
        `;
    }
};

export default TooltipStory;
