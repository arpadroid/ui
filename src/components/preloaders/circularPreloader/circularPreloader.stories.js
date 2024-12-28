import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const html = String.raw;
const CircularPreloaderStory = {
    title: 'Preloaders/Circular Preloader',
    tags: [],
    getArgs: () => ({
        text: '',
        content: ''
    }),
    getArgTypes: (category = 'Circular Preloader Props') => ({
        text: { control: { type: 'text' }, table: { category } },
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
    render: args => {
        return html`<circular-preloader ${attrString(args)}>${args.content}</circular-preloader>`;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: CircularPreloaderStory.getArgTypes(),
    args: CircularPreloaderStory.getArgs()
};

export const Test = {
    ...Default,
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('truncate-text');
        const preloader = canvasElement.querySelector('circular-preloader');
        return { canvas, preloader };
    },
    play: async ({ canvasElement, step }) => {
        const setup = await Test.playSetup(canvasElement);
        const { preloader } = setup;
        await step('renders the circular preloader text', async () => {
            await waitFor(() => expect(preloader).not.toBeNull());
        });
    }
};

export default CircularPreloaderStory;
