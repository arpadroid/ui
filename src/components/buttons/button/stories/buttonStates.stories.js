/**
 * @typedef {import('../button').default} Button
 * @typedef {import('../button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} ButtonMetaStatesMetaType
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} ButtonStatesStoryType
 */

import { expect } from 'storybook/test';
import ButtonStory from './button.stories';
import { $attr } from '@arpadroid/tools';
const html = String.raw;
/** @type {ButtonMetaStatesMetaType} */
const ButtonStatesStory = {
    ...ButtonStory,
    component: 'arpa-button',
    title: 'UI/Buttons/Button/States'
};

/** @type {ButtonStatesStoryType} */
export const Disabled = {
    args: {
        disabled: true
    },
    play: async ({ canvas, step }) => {
        await customElements.whenDefined('arpa-button');
        const buttonNode = /** @type {HTMLButtonElement} */ (canvas.getByRole('button'));
        await step('renders the button', async () => {
            expect(buttonNode).not.toBeNull();
        });
    },
    render: ({ ...args }) => {
        return html`<arpa-button ${$attr(args)}>Disabled Button</arpa-button>`;
    }
};

/** @type {ButtonStatesStoryType} */
export const Focused = {
    play: async ({ canvas }) => {
        await customElements.whenDefined('arpa-button');
        const button = canvas.getByRole('button');
        button.focus();
    },
    render: ({ ...args }) => {
        return html`<arpa-button ${$attr(args)}>Focused Button</arpa-button>`;
    }
};

export default ButtonStatesStory;
