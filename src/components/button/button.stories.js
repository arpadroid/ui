import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';
const category = 'Button Props';
const html = String.raw;
const ButtonStory = {
    title: 'UI/Buttons/Button',
    tags: [],
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-button');
        const buttonNode = canvasElement.querySelector('button');
        return { canvas, buttonNode };
    },
    args: {
        content: 'Click me',
        icon: 'task_alt',
        tooltip: 'If you click me something awesome will happen.',
        tooltipPosition: 'top',
    },
    argTypes: {
        content: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        iconRight: { control: { type: 'text' }, table: { category } },
        tooltip: { control: { type: 'text' }, table: { category } },
        tooltipPosition: {
            control: { type: 'select' },
            options: ['top', 'bottom', 'left', 'right'],
            table: { category }
        },
        variant: {
            description: 'The field variant.',
            options: ['primary', 'secondary', 'tertiary', 'danger', 'warning', 'delete'],
            control: { type: 'select' },
            table: { category }
        }
    },
    render: args => {
        const content = args.content;
        delete args.content;
        return html`<arpa-button ${attrString(args)}>${content}</arpa-button>`;
    }
};

export const Default = {
    name: 'Render',
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
    args: { ...Default.args, disabled: true, content: 'Disabled Button' },
    play: async ({ canvasElement, step }) => {
        const setup = await ButtonStory.playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });
    }
};

export default ButtonStory;
