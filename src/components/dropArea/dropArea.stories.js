import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;
const DropAreaStory = {
    title: 'Components/Drop Area',
    tags: [],
    getArgs: () => ({}),
    getArgTypes: (category = 'DropArea Props') => ({
        hasInput: { control: { type: 'boolean' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        content: { control: { type: 'text' }, table: { category } }
    }),
    render: args => {
        return html`<drop-area ${attrString(args)}></drop-area>`;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: DropAreaStory.getArgTypes(),
    args: DropAreaStory.getArgs(),
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('drop-area');
        const dropAreaNode = canvasElement.querySelector('drop-area');
        return { canvas, dropAreaNode };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Default.playSetup(canvasElement);
        const { dropAreaNode } = setup;
        await step('renders the drop area', async () => {
            await waitFor(() => expect(dropAreaNode).not.toBeNull());
        });
    }
};

export default DropAreaStory;
