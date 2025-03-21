import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';

const html = String.raw;
const DarkModeButtonStory = {
    title: 'UI/Buttons/Dark Mode Button',
    tags: [],
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('dark-mode-button');
        const buttonNode = canvasElement.querySelector('dark-mode-button');
        return { canvas, buttonNode };
    },
    render: args => {
        return html`<dark-mode-button ${attrString(args)}></dark-mode-button>`;
    }
};

export const Default = {
    name: 'Render'
};

export const Test = {
    name: 'Test',
    play: async ({ canvasElement, step }) => {
        const setup = await DarkModeButtonStory.playSetup(canvasElement);
        const { buttonNode, canvas } = setup;
        await step('renders the button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });

        await step('Focuses the button and expects tooltip', async () => {
            buttonNode.button.focus();
            await waitFor(() => {
                expect(canvas.getByText('Dark Mode')).toBeVisible();
            });
        });

        await step('Clicks the button and expects dark mode', async () => {
            buttonNode.button.click();
            const darkStyles = document.getElementById('dark-styles');
            await waitFor(() => {
                expect(darkStyles).not.toHaveAttribute('disabled');
                expect(canvas.getByText('Light Mode')).toBeVisible();
            });
        });

        await step('Clicks the button again and expects light mode', async () => {
            buttonNode.button.click();
            const darkStyles = document.getElementById('dark-styles');
            await waitFor(() => {
                expect(darkStyles).toHaveAttribute('disabled');
                expect(canvas.getByText('Dark Mode')).toBeVisible();
            });
        });
    }
};

export default DarkModeButtonStory;
