/**
 * @typedef {import('../button').default} Button
 * @typedef {import('../button.types').ButtonConfigType} ButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ButtonConfigType>} ButtonMetaStatesMetaType
 * @typedef {import('@storybook/web-components-vite').StoryObj<ButtonConfigType>} ButtonStatesStoryType
 */

import { expect, waitFor } from 'storybook/test';
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

/** @type {ButtonStatesStoryType} */
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

export default ButtonStatesStory;
