/**
 * @typedef {import('../button.js').default} Button
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 * @typedef {import('@storybook/web-components-vite').Args} Args
 */

import { waitFor, expect } from 'storybook/test';
import { playSetup } from '../stories/button.stories.util';
import { attrString } from '@arpadroid/tools';
import ButtonStory from './button.stories';
const html = String.raw;

/** @type {Meta} */
const ButtonTestsStory = {
    title: 'UI/Buttons/Button/Tests',
    render: ButtonStory.render
};

const setNewIconTest = (/** @type {Button} */ buttonComponent) => {
    buttonComponent.setIcon('home');
    const iconNode = buttonComponent.querySelector('.arpaButton__icon');
    expect(iconNode).toHaveTextContent('home');
};

const setRightIconTest = (/** @type {Button} */ buttonComponent) => {
    buttonComponent.setIconRight('person');
    const iconNode = buttonComponent.querySelector('.arpaButton__rhsIcon');
    expect(iconNode).toHaveTextContent('person');
};

const setContentTest = (/** @type {Button} */ buttonComponent) => {
    buttonComponent.setContent('New content');
    const contentNode = buttonComponent.querySelector('.arpaButton__content');
    expect(contentNode).toHaveTextContent('New content');
};

const setTooltipTest = async (/** @type {Button} */ buttonComponent) => {
    buttonComponent.setTooltip('New tooltip');
    await waitFor(() => {
        const tooltip = buttonComponent.querySelector('arpa-tooltip');
        expect(tooltip).toHaveTextContent('New tooltip');
    });
};

/** @type {StoryObj} */
export const Test = {
    args: {
        content: 'Click me',
        icon: 'task_alt',
        iconRight: 'person',
        tooltip: 'If you click me something awesome will happen.',
        tooltipPosition: 'top'
    },

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

        await step('Sets a new icon', async () => setNewIconTest(buttonComponent));
        await step('Sets a new right icon', async () => setRightIconTest(buttonComponent));
        await step('Sets new content', async () => setContentTest(buttonComponent));
        await step('sets a new tooltip', async () => setTooltipTest(buttonComponent));
    }
};

/** @type {StoryObj} */
export const DynamicRender = {
    args: {
        content: '',
        icon: '',
        iconRight: '',
        tooltip: '',
        tooltipPosition: ''
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { buttonComponent } = setup;

        await step('Sets a new icon', async () => setNewIconTest(buttonComponent));
        await step('Sets a new right icon', async () => setRightIconTest(buttonComponent));
        await step('Sets new content', async () => setContentTest(buttonComponent));
        await step('sets a new tooltip', async () => setTooltipTest(buttonComponent));
    }
};

export default ButtonTestsStory;
