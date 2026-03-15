/**
 * @typedef {import('../button').default} Button
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 */
import { attrString } from '@arpadroid/tools';

const category = 'Button Props';
const html = String.raw;
/** @type {Meta} */
const ButtonStory = {
    title: 'UI/Buttons/Button',
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
    name: 'Render',
    render: ButtonStory.render
};

export default ButtonStory;
