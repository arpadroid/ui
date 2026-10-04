/**
 * @typedef {import('../button').default} Button
 * @typedef {import('../button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} Story
 */
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
        tooltip: 'Button tooltip',
        tooltipPosition: 'bottom'
    },
    render: ({ ...args }) => {
        return html`<arpa-button ${$attr(args)}>Button</arpa-button>`;
    }
};

/** @type {Story} */
export const Default = {
    parameters: defaultParams,
    name: 'Render',
    args: {
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
    play: async ({ canvasElement, step }) => {
        step('shows the tooltip on focus', async () => {
            const button = /** @type {Button} */ (canvasElement.querySelector('arpa-button'));
            await button.promise;
            await button.focus();
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

/** @type {Story} */
export const Disabled = {
    args: {
        disabled: true
    },
    play: async ({ step, canvas, canvasElement }) => {
        const buttonComponent = /** @type {Button} */ (canvasElement.querySelector('arpa-button'));
        await buttonComponent.promise;
        await step('renders the button', async () => {
            const button = canvas.getByRole('button');
            expect(button).toBeInTheDocument();
            expect(button).toBeDisabled();
            await waitFor(() => {
                expect(buttonComponent).not.toHaveAttribute('disabled');
            });
        });
    },
    render: ({ ...args }) => {
        return html`<arpa-button ${$attr(args)}>Disabled Button</arpa-button>`;
    }
};

/** @type {Story} */
export const Focused = {
    args: {
        tooltip: 'Button tooltip'
    },
    render: ({ ...args }) => {
        return html`<arpa-button ${$attr(args)}>Focused Button</arpa-button>`;
    },
    play: async ({ step, canvas, canvasElement }) => {
        const button = /** @type {Button} */ (canvasElement.querySelector('arpa-button'));
        await button.focus();
        step('focuses the button', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Button tooltip')).toBeVisible();
            });
        });
    }
};

export default ButtonStory;
