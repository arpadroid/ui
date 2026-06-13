/**
 * @typedef {import('./darkModeButton.types').DarkModeButtonConfigType} DarkModeButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<DarkModeButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<DarkModeButtonConfigType>} Story
 * @typedef {import('./darkModeButton').default} DarkModeButton
 */
import { expect, userEvent } from 'storybook/test';

/** @type {Meta} */
const DarkModeButtonStory = {
    title: 'UI/Buttons/Dark Mode Button',
    tags: [],
    component: 'dark-mode-button'
};

/** @type {Story} */
export const Default = {
    name: 'Render'
};

/** @type {Story} */
export const Test = {
    name: 'Test',
    play: async ({ canvasElement, step, canvas }) => {
        await customElements.whenDefined('dark-mode-button');

        const buttonComponent = /** @type {DarkModeButton} */ (
            canvasElement.querySelector('dark-mode-button')
        );
        await buttonComponent?.promise;
        const button = /** @type {HTMLButtonElement} */ (buttonComponent?.button);
        await step('renders the button', async () => {
            expect(button).toBeInTheDocument();
        });

        await step('Focuses the button and expects tooltip', () => {
            button?.focus();
            expect(canvas.getByText('Dark Mode')).toBeVisible();
        });

        await step('Clicks the button and expects dark mode', async () => {
            await userEvent.click(button);
            const darkStyles = document.getElementById('dark-styles');
            expect(darkStyles).not.toHaveAttribute('disabled');
            expect(canvas.getByText('Light Mode')).toBeVisible();
        });

        await step('Clicks the button again and expects light mode', async () => {
            await userEvent.click(button);
            const darkStyles = document.getElementById('dark-styles');
            expect(darkStyles).toHaveAttribute('disabled');
            expect(canvas.getByText('Dark Mode')).toBeVisible();
        });
    }
};

export default DarkModeButtonStory;
