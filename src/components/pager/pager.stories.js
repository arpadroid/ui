/**
 * @typedef {import('./list.js').default} List
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';

const html = String.raw;
const PagerStory = {
    title: 'Components/Pager',
    tags: [],
    getArgs: () => {
        return {
            className: 'pager',
            currentPage: 2,
            totalPages: 10,
            maxNodes: 7,
            hasArrowControls: true,
            hasInput: false,
            urlParam: 'page'
        };
    },
    getArgTypes: (category = 'Pager Props') => {
        return {
            title: { control: { type: 'text' }, table: { category } },
            className: { control: { type: 'text' }, table: { category } },
            currentPage: { control: { type: 'number' }, table: { category } },
            totalPages: { control: { type: 'number' }, table: { category } },
            maxNodes: { control: { type: 'number' }, table: { category } },
            hasArrowControls: { control: { type: 'boolean' }, table: { category } },
            hasInput: { control: { type: 'boolean' }, table: { category } },
            urlParam: { control: { type: 'text' }, table: { category } }
        };
    },
    render: args => html`
        <arpa-pager id="demo-pager" ${attrString(args)} views="grid, list"></arpa-pager>

        <script type="module">
            await customElements.whenDefined('arpa-pager');
            const pager = document.getElementById('demo-pager');
            pager.onChange(({ page }) => pager.set(page));
        </script>
    `
};

export const Default = {
    name: 'Render',
    parameters: {},
    // argTypes: PagerStory.getArgTypes(),
    args: PagerStory.getArgs()
};

export const Test = {
    args: Default.args,
    parameters: {},
    args: {
        ...Default.args
    },
    parameters: {
        controls: { disable: true },
        usage: { disable: true },
        options: { selectedPanel: 'storybook/interactions/panel' }
    },
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-list');
        const listNode = canvasElement.querySelector('arpa-list');
        return { canvas, listNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { canvas, listNode } = setup;
        console.log('listNode', listNode);
    }
};

export default PagerStory;
