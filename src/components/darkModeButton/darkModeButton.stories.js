import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from '@storybook/test';

const html = String.raw;
const DarkModeButtonStory = {
    title: 'UI/Buttons/DarkModeButton',
    tags: [],
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('dark-mode-button');
        const buttonNode = canvasElement.querySelector('button[is="dark-mode-button"]');
        return { canvas, buttonNode };
    },
    getArgs: () => ({}),
    // eslint-disable-next-line no-unused-vars
    getArgTypes: (category = 'Dark Mode Button Props') => ({}),
    render: args => {
        return html`<button is="dark-mode-button" ${attrString(args)}></button>`;
    }
};

export const Default = {
    name: 'Render',
    parameters: {},
    argTypes: DarkModeButtonStory.getArgTypes(),
    args: DarkModeButtonStory.getArgs(),

    play: async ({ canvasElement, step }) => {
        const setup = await DarkModeButtonStory.playSetup(canvasElement);
        const { buttonNode } = setup;
        await step('renders the button', async () => {
            await waitFor(() => expect(buttonNode).not.toBeNull());
        });
    }
};


export default DarkModeButtonStory;
