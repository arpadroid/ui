/**
 * @typedef {import('../button.js').default} Button
 * @typedef {import('../button.types.js').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} Story
 */

import { waitFor, expect } from 'storybook/test';
import { playSetup } from './button.stories.util';
import ButtonStory from './button.stories';
import { testParams } from '@arpadroid/module/storybook/helper';

/** @type {Meta} */
const ButtonTestsStory = {
    ...ButtonStory,
    component: 'arpa-button',
    title: 'UI/Buttons/Button/Tests'
};

/** @type {Story} */
export const Test = {
    args: {
        content: 'Click me',
        icon: 'check_circle',
        rhsIcon: 'person',
        tooltip: 'If you click me something awesome will happen.',
        tooltipPosition: 'top'
    },
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        const setup = await playSetup(canvasElement);
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
        const setup = await playSetup(canvasElement);
        const { buttonComponent } = setup;

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
