/**
 * @typedef {import('./button.js').default} Button
 */
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
        /** @type {Button} */
        const buttonComponent = canvasElement.querySelector('arpa-button');
        await buttonComponent.promise;
        const buttonNode = canvasElement.querySelector('button');
        return { canvas, buttonNode, buttonComponent };
    },
    args: {
        content: 'Click me',
        icon: 'task_alt',
        tooltip: 'If you click me something awesome will happen.',
        tooltipPosition: 'bottom'
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
    name: 'Render'
};

const setNewIconTest = buttonComponent => {
    buttonComponent.setIcon('home');
    const iconNode = buttonComponent.querySelector('.arpaButton__icon');
    expect(iconNode).toHaveTextContent('home');
};

const setRightIconTest = buttonComponent => {
    buttonComponent.setIconRight('person');
    const iconNode = buttonComponent.querySelector('.arpaButton__rhsIcon');
    expect(iconNode).toHaveTextContent('person');
};

const setContentTest = buttonComponent => {
    buttonComponent.setContent('New content');
    const contentNode = buttonComponent.querySelector('.arpaButton__content');
    expect(contentNode).toHaveTextContent('New content');
};

const setTooltipTest = async buttonComponent => {
    buttonComponent.setTooltip('New tooltip');
    const tooltip = buttonComponent.querySelector('arpa-tooltip');
    await waitFor(() => {
        expect(tooltip).toHaveTextContent('New tooltip');
    });
};

export const Test = {
    title: 'UI/Buttons/Button/Test',
    args: {
        content: 'Click me',
        icon: 'task_alt',
        iconRight: 'person',
        tooltip: 'If you click me something awesome will happen.',
        tooltipPosition: 'top'
    },
    play: async ({ canvasElement, step, canvas }) => {
        const setup = await ButtonStory.playSetup(canvasElement);
        const { buttonNode, buttonComponent } = setup;

        await step('Renders the button', async () => {
            expect(buttonNode).toBeInTheDocument();
            expect(canvas.getByText('Click me')).toBeInTheDocument();
        });

        await step('Shows the tooltip when the button is focused', async () => {
            buttonNode.focus();
            const tooltip = canvas.getByText('If you click me something awesome will happen.');
            expect(tooltip).toBeVisible();
        });

        await step('Sets a new icon', async () => setNewIconTest(buttonComponent));
        await step('Sets a new right icon', async () => setRightIconTest(buttonComponent));
        await step('Sets new content', async () => setContentTest(buttonComponent));
        await step('sets a new tooltip', async () => setTooltipTest(buttonComponent));
    }
};

export const TestDynamicRender = {
    args: {
        content: '',
        icon: '',
        iconRight: '',
        tooltip: '',
        tooltipPosition: ''
    },
    play: async ({ canvasElement, step }) => {
        const setup = await ButtonStory.playSetup(canvasElement);
        const { buttonComponent } = setup;

        await step('Sets a new icon', async () => setNewIconTest(buttonComponent));
        await step('Sets a new right icon', async () => setRightIconTest(buttonComponent));
        await step('Sets new content', async () => setContentTest(buttonComponent));
        await step('sets a new tooltip', async () => setTooltipTest(buttonComponent));
    }
};

export const VariantDisabled = {
    args: { ...Default.args, disabled: true, content: 'Disabled Button' },
    play: async ({ canvasElement, step }) => {
        const setup = await ButtonStory.playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the button', async () => {
            expect(buttonNode).not.toBeNull();
        });
    }
};

export const VariantDelete = {
    args: { ...Default.args, variant: 'delete', content: 'Delete Button', icon: undefined }
};

export default ButtonStory;
