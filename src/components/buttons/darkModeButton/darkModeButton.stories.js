/**
 * @typedef {import('./darkModeButton.types').DarkModeButtonConfigType} DarkModeButtonConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<DarkModeButtonConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<DarkModeButtonConfigType>} Story
 * @typedef {import('./darkModeButton').default} DarkModeButton
 */
import { expect, userEvent, waitFor } from 'storybook/test';

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
        const buttonComponent = /** @type {DarkModeButton} */ (
            canvasElement.querySelector('dark-mode-button')
        );
        await buttonComponent?.promise;
        const button = /** @type {HTMLButtonElement} */ (buttonComponent?.button);

        const darkStyles = document.getElementById('dark-styles');
        darkStyles?.setAttribute('disabled', '');

        await step('renders the button', async () => {
            expect(button).toBeInTheDocument();
        });

        await step('Focuses the button and expects tooltip', async () => {
            button?.focus();
            await waitFor(() => expect(canvas.getByText('Dark Mode')).toBeVisible());
        });

        await step('Clicks the button and expects dark mode', async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            await userEvent.click(button);
            const darkStyles = document.getElementById('dark-styles');
            expect(darkStyles).not.toHaveAttribute('disabled');
            expect(canvas.getByText('Light Mode')).toBeVisible();
        });

        await step('Clicks the button again and expects light mode', async () => {
            await userEvent.click(button);
            await waitFor(() => {
                const darkStyles = document.getElementById('dark-styles');
                expect(darkStyles).toHaveAttribute('disabled');
                expect(canvas.getByText('Dark Mode')).toBeVisible();
            });
        });
    }
};

export default DarkModeButtonStory;
