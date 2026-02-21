/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
import { getArgTypes, playSetup } from './tooltip.stories.util';
const html = String.raw;
/** @type {Meta} */
const TooltipStory = {
    title: 'UI/Components/Tooltip',
    tags: [],
    argTypes: getArgTypes()
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: getArgTypes(),
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
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
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
        ...getArgTypes(),
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
