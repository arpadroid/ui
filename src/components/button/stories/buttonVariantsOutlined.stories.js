/**
 * @typedef {import('../button.js').default} Button
 * @typedef {import('../button.types.js').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} ButtonMetaOutlinedType
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} ButtonVariantsStoryType
 */

import ButtonVariantsStory from './buttonVariantsFilled.stories.js';

/** @type {ButtonMetaOutlinedType} */
const ButtonVariantsOutlinedStory = {
    ...ButtonVariantsStory,
    args: {
        ...ButtonVariantsStory.args,
        content: 'Outlined'
    },
    title: 'UI/Buttons/Button/Variants/Outlined'
};

export default ButtonVariantsOutlinedStory;

/** @type {ButtonVariantsStoryType} */
export const Primary = {
    args: {
        content: 'Primary Outlined',
        variant: 'primary-outlined'
    }
};

/** @type {ButtonVariantsStoryType} */
export const Secondary = {
    args: {
        content: 'Secondary Outlined',
        variant: 'secondary-outlined'
    }
};

/** @type {ButtonVariantsStoryType} */
export const Tertiary = {
    args: {
        content: 'Tertiary Outlined',
        variant: 'tertiary-outlined'
    }
};

/** @type {ButtonVariantsStoryType} */
export const Submit = {
    args: {
        content: 'Submit Outlined',
        variant: 'submit-outlined',
        icon: undefined
    }
};

/** @type {ButtonVariantsStoryType} */
export const Delete = {
    args: {
        content: 'Delete Outlined',
        variant: 'delete-outlined',
        icon: undefined
    }
};

/** @type {ButtonVariantsStoryType} */
export const Highlight = {
    args: {
        content: 'Highlight Outlined',
        variant: 'highlight-outlined',
        icon: undefined
    }
};
