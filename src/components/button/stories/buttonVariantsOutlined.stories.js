/**
 * @typedef {import('../button.js').default} Button
 * @typedef {import('../button.types.js').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} Story
 */

import ButtonVariantsStory from './buttonVariantsFilled.stories.js';

/** @type {Meta} */
const ButtonVariantsOutlinedStory = {
    ...ButtonVariantsStory,
    component: 'arpa-button',
    args: {
        ...ButtonVariantsStory.args,
        content: 'Outlined'
    },
    title: 'UI/Buttons/Button/Variants/Outlined'
};

export default ButtonVariantsOutlinedStory;

/** @type {Story} */
export const Primary = {
    args: {
        content: 'Primary Outlined',
        variant: 'primary-outlined'
    }
};

/** @type {Story} */
export const Secondary = {
    args: {
        content: 'Secondary Outlined',
        variant: 'secondary-outlined'
    }
};

/** @type {Story} */
export const Tertiary = {
    args: {
        content: 'Tertiary Outlined',
        variant: 'tertiary-outlined'
    }
};

/** @type {Story} */
export const Submit = {
    args: {
        content: 'Submit Outlined',
        variant: 'submit-outlined',
        icon: undefined
    }
};

/** @type {Story} */
export const Delete = {
    args: {
        content: 'Delete Outlined',
        variant: 'delete-outlined',
        icon: undefined
    }
};

/** @type {Story} */
export const Highlight = {
    args: {
        content: 'Highlight Outlined',
        variant: 'highlight-outlined',
        icon: undefined
    }
};
