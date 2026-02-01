/**
 * @typedef {import('./button.js').default} Button
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
const category = 'Button Props';
const html = String.raw;
/** @type {Meta} */
const ButtonStory = {
    title: 'UI/Buttons/Button',
    tags: [],
    /** @param {HTMLElement} canvasElement */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-button');

        const buttonComponent = /** @type {Button} */ (canvasElement.querySelector('arpa-button'));
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
    render: (/** @type {Args} */ args) => {
        const content = args.content;
        delete args.content;
        return html`<arpa-button ${attrString(args)}>${content}</arpa-button>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render'
};

/**
 * @param {Button} buttonComponent
 */
const setNewIconTest = buttonComponent => {
    buttonComponent.setIcon('home');
    const iconNode = buttonComponent.querySelector('.arpaButton__icon');
    expect(iconNode).toHaveTextContent('home');
};

/**
 * @param {Button} buttonComponent
 */
const setRightIconTest = buttonComponent => {
    buttonComponent.setIconRight('person');
    const iconNode = buttonComponent.querySelector('.arpaButton__rhsIcon');
    expect(iconNode).toHaveTextContent('person');
};

/**
 * @param {Button} buttonComponent
 */
const setContentTest = buttonComponent => {
    buttonComponent.setContent('New content');
    const contentNode = buttonComponent.querySelector('.arpaButton__content');
    expect(contentNode).toHaveTextContent('New content');
};

/**
 * @param {Button} buttonComponent
 */
const setTooltipTest = async buttonComponent => {
    buttonComponent.setTooltip('New tooltip');
    const tooltip = buttonComponent.querySelector('arpa-tooltip');
    await waitFor(() => {
        expect(tooltip).toHaveTextContent('New tooltip');
    });
};

/** @type {StoryObj} */
export const Test = {
    title: 'UI/Buttons/Button/Test',
    args: {
        content: 'Click me',
        icon: 'task_alt',
        iconRight: 'person',
        tooltip: 'If you click me something awesome will happen.',
        tooltipPosition: 'top'
    },
    /**
     * @param {StoryContext} context
     */
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

/** @type {StoryObj} */
export const TestDynamicRender = {
    args: {
        content: '',
        icon: '',
        iconRight: '',
        tooltip: '',
        tooltipPosition: ''
    },
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await ButtonStory.playSetup(canvasElement);
        const { buttonComponent } = setup;

        await step('Sets a new icon', async () => setNewIconTest(buttonComponent));
        await step('Sets a new right icon', async () => setRightIconTest(buttonComponent));
        await step('Sets new content', async () => setContentTest(buttonComponent));
        await step('sets a new tooltip', async () => setTooltipTest(buttonComponent));
    }
};

/** @type {StoryObj} */
export const VariantDisabled = {
    args: { ...Default.args, disabled: true, content: 'Disabled Button' },
    play: async (/** @type {StoryContext} */ { canvasElement, step }) => {
        const setup = await ButtonStory.playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the button', async () => {
            expect(buttonNode).not.toBeNull();
        });
    }
};

/** @type {StoryObj} */
export const VariantDelete = {
    args: { ...Default.args, variant: 'delete', content: 'Delete Button', icon: undefined }
};

export default ButtonStory;
