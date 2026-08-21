/**
 * @typedef {import('../button.js').default} Button
 * @typedef {import('../button.types.js').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} Story
 */

import { waitFor, expect } from 'storybook/test';
import ButtonStory from './button.stories';
import { testParams } from '@arpadroid/module/storybook/helper';
import { $attr } from '@arpadroid/tools';

/** @type {Meta} */
const ButtonTestsStory = {
    ...ButtonStory,
    component: 'arpa-button',
    title: 'UI/Buttons/Button/Tests'
};

const html = String.raw;
/** @type {Story} */
export const Test = {
    args: {
        icon: 'check_circle',
        rhsIcon: 'person',
        tooltip: 'If you click me something awesome will happen.',
        tooltipPosition: 'top'
    },
    render: ({ ...args }) => {
        return html`<arpa-button ${$attr(args)}>Click me</arpa-button>`;
    },
    parameters: testParams,
    play: async ({ canvas, canvasElement, step }) => {
        await customElements.whenDefined('arpa-button');
        const buttonComponent = /** @type {Button} */ (canvasElement.querySelector('arpa-button'));
        await buttonComponent.promise;
        const buttonNode = await waitFor(() => canvas.getByRole('button'));

        await step('Renders the button', async () => {
            expect(buttonNode).toBeInTheDocument();
            expect(canvas.getByText('Click me')).toBeInTheDocument();
        });

        await step('Shows the tooltip when the button is focused', async () => {
            buttonNode.focus();
            const tooltip = canvas.getByText('If you click me something awesome will happen.');
            expect(tooltip).toBeVisible();
        });

        await step('Sets a new icon', async () => {
            buttonComponent.setProp('icon', 'labs');
            const iconNode = buttonComponent.querySelector('.arpaButton__icon');
            await waitFor(() => expect(iconNode).toHaveTextContent('labs'));
        });

        await step('Sets a new right icon', async () => {
            buttonComponent.setProp('rhsIcon', 'person');
            const iconNode = buttonComponent.querySelector('.arpaButton__rhsIcon');
            await waitFor(() => expect(iconNode).toHaveTextContent('person'));
        });

        await step('Sets new content', async () => {
            buttonComponent.setProp('content', 'Test button');
            const contentNode = buttonComponent.querySelector('.arpaButton__content');
            await waitFor(() => expect(contentNode).toHaveTextContent('Test button'));
        });

        await step('Sets a new tooltip', async () => {
            buttonComponent.setProp('tooltip', 'New tooltip');
            await waitFor(() => expect(canvas.getByText('New tooltip')).toBeInTheDocument());
        });
    }
};

/** @type {Story} */
export const DynamicRender = {
    args: {
        content: '',
        icon: '',
        rhsIcon: '',
        tooltip: '',
        tooltipPosition: undefined
    },
    parameters: testParams,
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('arpa-button');
        const buttonComponent = /** @type {Button} */ (canvasElement.querySelector('arpa-button'));
        await buttonComponent.promise;

        await step('Sets an RHS icon', async () => {
            buttonComponent.setProp('rhsIcon', 'person');
            await waitFor(() => {
                const iconNode = buttonComponent.querySelector('.arpaButton__rhsIcon');
                expect(iconNode).toHaveTextContent('person');
            });
        });

        await step('Sets an icon', async () => {
            buttonComponent.setProp('icon', 'labs');
            await waitFor(() => {
                const iconNode = buttonComponent.querySelector('.arpaButton__icon');
                expect(iconNode).toHaveTextContent('labs');
            });
        });

        await step('Sets content', async () => {
            buttonComponent.setProp('content', 'Test button');
            await waitFor(() => {
                const contentNode = buttonComponent.querySelector('.arpaButton__content');
                expect(contentNode).toHaveTextContent('Test button');
            });
        });

        await step('Sets a tooltip', async () => {
            buttonComponent.setProp('tooltip', 'New tooltip');
            await waitFor(() => {
                const tooltip = buttonComponent.querySelector('arpa-tooltip');
                expect(tooltip).toHaveTextContent('New tooltip');
            });
        });

        await step('Verifies elements are rendered in the right position', async () => {
            const button = buttonComponent.querySelector('button');
            const iconNode = buttonComponent.querySelector('.arpaButton__icon');
            const rhsIconNode = buttonComponent.querySelector('.arpaButton__rhsIcon');
            const contentNode = buttonComponent.querySelector('.arpaButton__content');

            expect(button?.firstElementChild).toBe(iconNode);
            expect(rhsIconNode?.previousElementSibling).toBe(contentNode);
            expect(contentNode?.previousElementSibling).toBe(iconNode);
        });
    }
};

export default ButtonTestsStory;
