/**
 * @typedef {import('../button.js').default} Button
 * @typedef {import('../button.types.js').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} ButtonMetaVariantsMetaType
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} ButtonVariantsStoryType
 */

/** @type {ButtonMetaVariantsMetaType} */
const ButtonVariantsStory = {
    title: 'UI/Buttons/Button/Variants',
    component: 'arpa-button',
    args: {
        content: 'Variant',
        tooltip: 'There are several variants such as primary, secondary, and delete.'
    }
};

/** @type {ButtonVariantsStoryType} */
export const Primary = {
    args: {
        content: 'Primary Button',
        variant: 'primary'
    }
};

/** @type {ButtonVariantsStoryType} */
export const PrimaryOutlined = {
    args: {
        content: 'Primary Outlined Button',
        variant: 'primary-outlined'
    }
};

/** @type {ButtonVariantsStoryType} */
export const Secondary = {
    args: {
        content: 'Secondary Button',
        variant: 'secondary'
    }
};

/** @type {ButtonVariantsStoryType} */
export const SecondaryOutlined = {
    args: {
        content: 'Secondary Outlined Button',
        variant: 'secondary-outlined'
    }
};

/** @type {ButtonVariantsStoryType} */
export const Tertiary = {
    args: {
        content: 'Tertiary Button',
        variant: 'tertiary'
    }
};

/** @type {ButtonVariantsStoryType} */
export const TertiaryOutlined = {
    args: {
        content: 'Tertiary Outlined Button',
        variant: 'tertiary-outlined'
    }
};

/** @type {ButtonVariantsStoryType} */
export const Delete = {
    args: {
        content: 'Delete Button',
        variant: 'delete'
    }
};

export default ButtonVariantsStory;
