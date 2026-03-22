/**
 * @typedef {import('../button').default} Button
 * @typedef {import('../button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} ButtonMetaType
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} ButtonStoryType
 */
const html = String.raw;
/** @type {ButtonMetaType} */
const ButtonStory = {
    title: 'UI/Buttons/Button',
    component: 'arpa-button',
    args: {
        icon: 'task_alt',
        tooltip: 'The button component ',
        tooltipPosition: 'bottom',
    }
};

/** @type {ButtonStoryType} */
export const Default = {
    name: 'Render',
    args: {
        content: html`Button`,
        icon: 'task_alt',
        tooltip: 'This is a tooltip.',
        tooltipPosition: 'top'
    }
};

/** @type {ButtonStoryType} */
export const Zones = {
    name: 'Zones',
    args: {
        tooltip: '',
        content: html`<zone name="content">Button</zone>
            <zone name="tooltip-content">
                This zone can be used to define <strong>custom tooltip content</strong> with any html.
            </zone>`
    }
};

export default ButtonStory;
