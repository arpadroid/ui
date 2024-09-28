import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;
const TooltipStory = {
    title: 'Components/Tooltip',
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
    render: args => html` <arpa-tooltip ${attrString(args)}> </arpa-tooltip> `
};

export const Test = {
    ...Default,
    name: 'Test',
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-tooltip');
        const tooltipNode = canvasElement.querySelector('arpa-tooltip');
        return { canvas, tooltipNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { tooltipNode } = setup;
        await step('renders the tooltip', async () => {
            await waitFor(() => expect(tooltipNode).not.toBeNull());
            expect(tooltipNode).toBeDefined();
        });
    }
};

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
    render: args => {
        return html`
            <arpa-tooltip ${attrString(args)}>
                <arpa-zone name="handler"><arpa-icon>info</arpa-icon>${args.handler}</arpa-zone>
                <arpa-zone name="tooltip-content">${args.content}</arpa-zone>
            </arpa-tooltip>
        `;
    }
};

export default TooltipStory;
