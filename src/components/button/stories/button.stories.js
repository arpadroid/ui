import { playSetup } from './button.stories.util';
import { waitFor, expect } from 'storybook/test';
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
        tooltipPosition: 'bottom'
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
        content: html`<zone name="content">Button with zones</zone>
            <zone name="tooltip-content">
                This zone can be used to define <strong>custom tooltip content</strong> with any html.
            </zone>`
    },
    play: async ({ canvasElement, canvas, step }) => {
        await playSetup(canvasElement);
        step('shows the tooltip on focus', async () => {
            const buttonNode = canvas.getByRole('button');
            expect(buttonNode).toBeInTheDocument();
            buttonNode.focus();
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for tooltip to appear
            await waitFor(() => {
                const tooltip = canvasElement.querySelector('arpa-tooltip');
                expect(tooltip).toBeVisible();
                expect(tooltip).toHaveTextContent(
                    'This zone can be used to define custom tooltip content with any html.'
                );
            });
        });
    }
};

export default ButtonStory;
