/**
 * @typedef {import('../button.js').default} Button
 * @typedef {import('../button.types.js').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} Story
 */

import { playSetup } from './button.stories.util.js';
import { expect } from 'storybook/test';

/** @type {Meta} */
const ButtonVariantsStory = {
    title: 'UI/Buttons/Button/Variants/Filled',
    component: 'arpa-button',
    args: {
        icon: 'star',
        content: 'Variant',
        tooltipPosition: 'bottom',
        tooltip: 'There are several variants such as primary, secondary, and delete.'
    }
};

/** @type {Story} */
export const Primary = {
    args: {
        content: 'Primary Button',
        variant: 'primary'
    }
};

/** @type {Story} */
export const Secondary = {
    args: {
        content: 'Secondary Button',
        variant: 'secondary'
    }
};

/** @type {Story} */
export const Tertiary = {
    args: {
        content: 'Tertiary Button',
        variant: 'tertiary'
    }
};

/** @type {Story} */
export const Delete = {
    args: {
        content: 'Delete Button',
        variant: 'delete',
        icon: undefined
    }
};

/** @type {Story} */
export const Submit = {
    args: {
        content: 'Submit Button',
        variant: 'submit',
        icon: undefined
    },
    play: async ({ canvasElement, step }) => {
        const { buttonNode } = await playSetup(canvasElement);
        await step('renders the submit button with the correct type', async () => {
            expect(buttonNode).toBeInTheDocument();
            expect(buttonNode).toHaveAttribute('type', 'submit');
        });
    }
};

/** @type {Story} */
export const Highlight = {
    args: {
        content: 'Highlight Button',
        variant: 'highlight'
    }
};

export default ButtonVariantsStory;
