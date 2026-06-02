/**
 * @typedef {import('./truncateText.types.js').TruncateTextConfigType } TruncateTextConfigType
 * @typedef {import('./truncateText.js').default} TruncateText
 * @typedef {import('@storybook/web-components-vite').Meta<TruncateTextConfigType & {text: string}>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} Story
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect } from 'storybook/test';
const html = String.raw;

/**
 * Sets up the testing environment for the truncate text component.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{truncateTextNode: TruncateText}>}
 */
async function playSetup(canvasElement) {
    await customElements.whenDefined('truncate-text');
    const truncateTextNode = /** @type {TruncateText} */ (canvasElement.querySelector('truncate-text'));
    await truncateTextNode?.promise;
    return { truncateTextNode };
}

/** @type {Meta} */
const TruncateTextStory = {
    title: 'UI/Truncate Text',
    tags: [],
    component: 'truncate-text',
    args: {
        maxLength: 40,
        text: 'In the vast expanse of the cosmos, stars are born from clouds of dust, only to collapse and scatter that dust again when they die. Every atom in your body was forged in the heart of a dying star, millions of years before the Earth existed. Yet here you are, a collection of star-stuff, capable of looking up at the night sky and wondering about your origins. The universe is as much within you as it is outside of you.'
    },
    render: args => {
        const { text, ...rest } = args;
        return html`<truncate-text ${attrString(rest)}>${text}</truncate-text>`;
    }
};

/** @type {Story} */
export const Default = {
    name: 'Render',
    parameters: {},
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { truncateTextNode } = setup;
        await step('Renders the truncate text component.', async () => {
            await waitFor(() => expect(truncateTextNode).not.toBeNull());
            expect(truncateTextNode.textContent).toContain('In the vast expanse of the cosmos, stars');
        });
    }
};

/** @type {Story} */
export const CustomMaxLength = {
    name: 'Custom Max Length',
    args: {
        maxLength: 60
    },
    play: async ({ canvasElement, step, canvas }) => {
        const setup = await playSetup(canvasElement);
        const { truncateTextNode } = setup;
        await step('Renders the truncate text component with a custom max length.', async () => {
            await waitFor(() => {
                expect(truncateTextNode).toBeInTheDocument();
                expect(truncateTextNode.textContent).toContain(
                    'In the vast expanse of the cosmos, stars are born from cloud'
                );
                expect(canvas.queryByText('...')).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const WithReadMoreButton = {
    args: {
        hasButton: true
    },
    play: async ({ canvasElement, step, canvas }) => {
        const setup = await playSetup(canvasElement);
        const { truncateTextNode } = setup;
        await step('Renders the truncate text component with a read more button.', async () => {
            await waitFor(() => {
                const readMoreButton = canvas.getByRole('button', { name: /read more/i });
                expect(readMoreButton).toBeInTheDocument();
                expect(canvas.getByText('In the vast expanse of the cosmos, stars')).toBeInTheDocument();
                expect(canvas.getByText('...')).toBeInTheDocument();
            });
        });

        await step('Expands the text when the read more button is clicked.', async () => {
            const readMoreButton = canvas.getByRole('button', { name: /read more/i });
            readMoreButton.click();
            await waitFor(() =>
                expect(truncateTextNode.textContent).toContain(
                    'The universe is as much within you as it is outside of you.'
                )
            );
            expect(truncateTextNode).not.toHaveAttribute('is-truncated');
            expect(canvas.queryByText('...')).not.toBeInTheDocument();
            expect(canvas.queryByRole('button', { name: /read more/i })).not.toBeInTheDocument();
            expect(canvas.queryByRole('button', { name: /read less/i })).toBeInTheDocument();
        });
    }
};

/** @type {Story} */
export const ShortTextNoTruncation = {
    args: {
        text: 'Short text that should not be truncated.',
        maxLength: 50,
        hasButton: true
    },
    play: async ({ canvasElement, step, canvas }) => {
        const setup = await playSetup(canvasElement);
        const { truncateTextNode } = setup;
        await step('Renders the full text without truncation for short text.', async () => {
            expect(truncateTextNode).toBeInTheDocument();
            expect(truncateTextNode.textContent.trim()).toBe('Short text that should not be truncated.');
            expect(canvas.queryByText('...')).not.toBeInTheDocument();
            expect(canvas.queryByRole('button', { name: /read more/i })).not.toBeInTheDocument();
            expect(canvas.queryByRole('button', { name: /read less/i })).not.toBeInTheDocument();
        });
    }
};

export default TruncateTextStory;
