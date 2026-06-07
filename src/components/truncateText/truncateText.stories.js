/**
 * @typedef {import('./truncateText.types.js').TruncateTextConfigType } TruncateTextConfigType
 * @typedef {import('./truncateText.js').default} TruncateText
 * @typedef {import('@storybook/web-components-vite').Meta<TruncateTextConfigType & {children: string}>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} Story
 */
import { attrString } from '@arpadroid/tools';
import { waitFor, expect } from 'storybook/test';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
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
    parameters: {
        layout: 'padded'
    },
    args: {
        maxLength: 79,
        children:
            'In the vast expanse of the cosmos, stars are born from clouds of dust, only to collapse and scatter that dust again when they die. Every atom in your body was forged in the heart of a dying star, millions of years before the Earth existed. Yet here you are, a collection of star-stuff, capable of looking up at the night sky and wondering about your origins. The universe is as much within you as it is outside of you.'
    },
    render: args => {
        const { children, ...rest } = args;
        return html`
            <style>
                #storybook-root {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                }
                truncate-text {
                    width: 100%;
                    max-width: 620px;
                }
            </style>
            <truncate-text ${attrString(rest)}> ${children} </truncate-text>
        `;
    }
};

/** @type {Story} */
export const Default = {
    name: 'Render',
    parameters: defaultParams
};

/** @type {Story} */
export const Test = {
    parameters: testParams,
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
export const TestWithButton = {
    args: {
        hasButton: true,
        maxLength: 60
    },
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        const setup = await playSetup(canvasElement);
        const { truncateTextNode } = setup;
        await step('Renders the truncate text component with a read more button.', async () => {
            await waitFor(() => {
                const readMoreButton = canvas.getByRole('button', { name: /read more/i });
                expect(readMoreButton).toBeInTheDocument();
                expect(
                    canvas.getByText('In the vast expanse of the cosmos, stars are born from cloud')
                ).toBeInTheDocument();
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

        await step('Collapses the text when the read less button is clicked.', async () => {
            const readLessButton = canvas.getByRole('button', { name: /read less/i });
            readLessButton.click();
            await waitFor(() =>
                expect(truncateTextNode.textContent).toContain(
                    'In the vast expanse of the cosmos, stars are born from cloud'
                )
            );
            expect(truncateTextNode).toHaveAttribute('is-truncated');
            expect(canvas.getByText('...')).toBeInTheDocument();
            expect(canvas.queryByRole('button', { name: /read more/i })).toBeInTheDocument();
            expect(canvas.queryByRole('button', { name: /read less/i })).not.toBeInTheDocument();
        });
    }
};

/** @type {Story} */
export const WithButtonInlineLayout = {
    name: 'Inline button and custom labels',
    args: {
        hasButton: true,
        maxLength: 60,
        inlineLayout: true,
        lblShow: '{i18n:lblShowMore}',
        lblHide: '{i18n:lblShowLess}',
        icon: 'expand_more',
        iconHide: 'expand_less'
    },
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        await playSetup(canvasElement);
        await step(
            'Renders the truncate text component with a read more button in inline layout.',
            async () => {
                await waitFor(() => {
                    const readMoreButton = canvas.getByRole('button', { name: /show more/i });
                    expect(readMoreButton).toBeInTheDocument();
                    expect(readMoreButton.closest('.truncateText__wrapper')).toBeInTheDocument();
                });
            }
        );
    }
};

/** @type {Story} */
export const ShortText = {
    args: {
        children: 'Short text that should not be truncated.',
        maxLength: 50,
        hasButton: true
    },
    parameters: testParams,
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

/** @type {Story} */
export const DynamicUpdates = {
    args: {
        hasButton: true,
        maxLength: 60
    },
    parameters: testParams,
    play: async ({ canvasElement, step, canvas }) => {
        const { truncateTextNode } = await playSetup(canvasElement);
        await step('Dynamically updates the text content and re-applies truncation.', async () => {
            truncateTextNode.setContent(
                'New dynamic text that exceeds the maximum length and should be truncated.'
            );
            await waitFor(() => {
                expect(truncateTextNode.textContent).toContain(
                    'New dynamic text that exceeds the maximum length and should'
                );
                expect(canvas.getByText('...')).toBeInTheDocument();
            });
        });

        await step('Expands the new text when the read more button is clicked.', async () => {
            const readMoreButton = canvas.getByRole('button', { name: /read more/i });
            readMoreButton.click();
            await waitFor(() =>
                expect(truncateTextNode.textContent).toContain(
                    'New dynamic text that exceeds the maximum length and should be truncated.'
                )
            );
            expect(truncateTextNode).not.toHaveAttribute('is-truncated');
            expect(canvas.queryByText('...')).not.toBeInTheDocument();
        });

        await step(
            'Adds new content that does not exceed the maximum length and ensures it is not truncated.',
            async () => {
                truncateTextNode.setContent('Short dynamic text.');
                await waitFor(() => {
                    expect(truncateTextNode.textContent.trim()).toBe('Short dynamic text.');
                    expect(canvas.queryByText('...')).not.toBeInTheDocument();
                    expect(canvas.queryByRole('button', { name: /read more/i })).not.toBeInTheDocument();
                    expect(canvas.queryByRole('button', { name: /read less/i })).not.toBeInTheDocument();
                });
            }
        );
    }
};

export default TruncateTextStory;
