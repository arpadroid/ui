/**
 * @typedef {import('./truncateText.types.js').TruncateTextConfigType } TruncateTextConfigType
 * @typedef {import('./truncateText.js').default} TruncateText
 * @typedef {import('../core/arpaElement/arpaElement.types').ArpaElementContentNodeType} ArpaElementContentNodeType
 * @typedef {import('@storybook/web-components-vite').Meta<TruncateTextConfigType & {children: string}>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} Story
 */
import { waitFor, expect, userEvent } from 'storybook/test';
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import { $attr } from '@arpadroid/tools';

const html = String.raw;

const text = `In the vast expanse of the cosmos, stars are born from clouds of dust, only to collapse and
scatter that dust again when they die. Every atom in your body was forged in the heart of a dying star,
millions of years before the Earth existed. Yet here you are, a collection of star-stuff, capable of looking
up at the night sky and wondering about your origins. The universe is as much within you as it is outside of
you.`;

/** @type {Meta} */
const TruncateTextStory = {
    title: 'UI/Truncate Text',
    tags: [],
    component: 'truncate-text',
    parameters: {
        layout: 'padded'
    },
    render: ({ ...args }) => {
        return html`<truncate-text ${$attr(args)}>${text}</truncate-text>`;
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
        const truncateTextNode = /** @type {TruncateText} */ (canvasElement.querySelector('truncate-text'));
        await truncateTextNode?.promise;
        await step('Renders the truncate text component with a custom max length.', async () => {
            await waitFor(() => {
                expect(truncateTextNode).toBeInTheDocument();
                expect(truncateTextNode.textContent.trim()).toContain(
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
        const truncateTextNode = /** @type {TruncateText} */ (canvasElement.querySelector('truncate-text'));
        await truncateTextNode?.promise;
        const contentNode = truncateTextNode?.nodes.content;
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
            await userEvent.click(readMoreButton);
            // @ts-ignore
            expect(contentNode).toHaveTextContent(text, { exact: false });
            expect(truncateTextNode).not.toHaveAttribute('is-truncated');
            expect(canvas.queryByText('...')).not.toBeInTheDocument();
            expect(canvas.queryByRole('button', { name: /read more/i })).not.toBeInTheDocument();
            expect(canvas.queryByRole('button', { name: /read less/i })).toBeInTheDocument();
        });

        await step('Collapses the text when the read less button is clicked.', async () => {
            const readLessButton = canvas.getByRole('button', { name: /read less/i });
            await userEvent.click(readLessButton);
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
        const truncateTextNode = /** @type {TruncateText} */ (canvasElement.querySelector('truncate-text'));
        await truncateTextNode?.promise;
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
        maxLength: 50,
        hasButton: true
    },
    parameters: testParams,
    render: ({ ...args }) => {
        return html`<truncate-text ${$attr(args)}>Short text that should not be truncated.</truncate-text>`;
    },
    play: async ({ canvasElement, step, canvas }) => {
        const truncateTextNode = /** @type {TruncateText} */ (canvasElement.querySelector('truncate-text'));
        await truncateTextNode?.promise;
        await step('Renders the full text without truncation for short text.', async () => {
            expect(truncateTextNode).toBeInTheDocument();
            await waitFor(() => {
                expect(truncateTextNode.textContent.trim()).toBe('Short text that should not be truncated.');
            });
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
        const truncateTextNode = /** @type {TruncateText} */ (canvasElement.querySelector('truncate-text'));
        await truncateTextNode?.promise;

        truncateTextNode.setAttribute('is-truncated', '');

        await step('Dynamically updates the text content and re-applies truncation.', async () => {
            await truncateTextNode.setContent(
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
            const readMoreButton = await waitFor(() => canvas.getByRole('button', { name: /read more/i }));
            await userEvent.click(readMoreButton, { delay: 10 });
            await waitFor(() => {
                expect(truncateTextNode.nodes.content.textContent).toContain(
                    'New dynamic text that exceeds the maximum length and should be truncated.'
                );
                expect(truncateTextNode).not.toHaveAttribute('is-truncated');
                expect(canvas.queryByText('...')).not.toBeInTheDocument();
            });
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
