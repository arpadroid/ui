import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';

const html = String.raw;
const ButtonStory = {
    title: 'Buttons/Button',
    tags: [],
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-button');
        const buttonNode = canvasElement.querySelector('button');
        return { canvas, buttonNode };
    },
    getArgs: () => ({ content: 'Click me', iconRight: 'send' }),
    getArgTypes: (category = 'Button Props') => ({
        content: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        iconRight: { control: { type: 'text' }, table: { category } },
        variant: {
            description: 'The field variant.',
            options: ['primary', 'secondary', 'tertiary', 'danger', 'warning', 'delete'],
            control: { type: 'select' },
            table: { category }
        }
    }),
    render: args => {
        return html`<button is="arpa-button" ${attrString(args)}></button>`;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: ButtonStory.getArgTypes(),
    args: ButtonStory.getArgs(),

    play: async ({ canvasElement, step }) => {
        const setup = await ButtonStory.playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });
    }
};

export const Disabled = {
    name: 'Disabled',
    parameters: {},
    argTypes: ButtonStory.getArgTypes(),
    args: { ...ButtonStory.getArgs(), disabled: true, content: 'Disabled Button' },
    play: async ({ canvasElement, step }) => {
        const setup = await ButtonStory.playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });
    }
};

export default ButtonStory;
