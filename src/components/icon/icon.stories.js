import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;
const IconStory = {
    title: 'UI/Components/Icon',
    tags: [],
    getArgs: () => ({ icon: 'sailing' }),
    getArgTypes: (category = 'Icon Props') => ({
        icon: { control: { type: 'text' }, table: { category } }
    }),
    render: args => {
        const icon = args.icon;
        delete args.icon;
        return html`<arpa-icon ${attrString(args)}>${icon}</arpa-icon>`;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: IconStory.getArgTypes(),
    args: IconStory.getArgs(),
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-icon');
        const iconNode = canvasElement.querySelector('arpa-icon');
        return { canvas, iconNode };
    },
    play: async ({ canvasElement, step }) => {
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
