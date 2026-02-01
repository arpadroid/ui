/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('./darkModeButton').default} DarkModeButton
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';


const html = String.raw;
/** @type {Meta} */
const DarkModeButtonStory = {
    title: 'UI/Buttons/Dark Mode Button',
    tags: [],
    /**
     * @param {HTMLElement} canvasElement
     */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('dark-mode-button');
        const buttonComponent = /** @type {DarkModeButton} */ (canvasElement.querySelector('dark-mode-button'));
        await buttonComponent?.promise;
        return { canvas, buttonNode: buttonComponent?.button, buttonComponent };
    },
    render: (/** @type {Record<string, unknown>} */ args) => {
        return html`<dark-mode-button ${attrString(args)}></dark-mode-button>`;
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render'
};

/** @type {StoryObj} */
export const Test = {
    name: 'Test',
    play: async (/** @type {import('@storybook/web-components-vite').StoryContext} */ { canvasElement, step }) => {
        const setup = await DarkModeButtonStory.playSetup(canvasElement);
        const { buttonNode, canvas } = setup;
        await step('renders the button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });

        await step('Focuses the button and expects tooltip', async () => {
            buttonNode.focus();
            await waitFor(() => {
                expect(canvas.getByText('Dark Mode')).toBeVisible();
            });
        });

        await step('Clicks the button and expects dark mode', async () => {
            buttonNode.click();
            const darkStyles = document.getElementById('dark-styles');
            await waitFor(() => {
                expect(darkStyles).not.toHaveAttribute('disabled');
                expect(canvas.getByText('Light Mode')).toBeVisible();
            });
        });

        await step('Clicks the button again and expects light mode', async () => {
            buttonNode.click();
            const darkStyles = document.getElementById('dark-styles');
            await waitFor(() => {
                expect(darkStyles).toHaveAttribute('disabled');
                expect(canvas.getByText('Dark Mode')).toBeVisible();
            });
        });
    }
};

export default DarkModeButtonStory;
