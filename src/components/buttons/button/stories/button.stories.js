/**
 * @typedef {import('../button').default} Button
 * @typedef {import('../button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} Story
 */
import { playSetup } from './button.stories.util';
import { waitFor, expect } from 'storybook/test';
import { defaultParams } from '@arpadroid/module/storybook/helper';
import { $attr } from '@arpadroid/tools';

const html = String.raw;

/** @type {Meta} */
const ButtonStory = {
    title: 'UI/Buttons/Button',
    component: 'arpa-button',
    args: {
        icon: 'check_circle',
        tooltip: 'The button component ',
        tooltipPosition: 'bottom'
    }
};

/** @type {Story} */
export const Default = {
    parameters: defaultParams,
    name: 'Render',
    args: {
        content: html`Button`,
        icon: 'check_circle',
        tooltip: 'This is a tooltip.',
        tooltipPosition: 'top'
    }
};

/** @type {Story} */
export const Zones = {
    name: 'Zones',
    args: {
        tooltip: ''
    },
    render: ({ ...args }) => {
        return html`
            <arpa-button ${$attr(args)}>
                <arpa-zone name="content">Zones</arpa-zone>
                <arpa-zone name="tooltip">
                    This zone can be used to define <strong>custom tooltip content</strong> with any html.
                </arpa-zone>
            </arpa-button>
        `;
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
