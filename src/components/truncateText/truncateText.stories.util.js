import { expect, within } from 'storybook/test';
/**
 * @typedef {import('./truncateText').default} TruncateText
 */

/**
 * Sets up the testing environment for the TruncateText component.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{canvas: any, truncateTextNode: TruncateText}>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    await customElements.whenDefined('truncate-text');
    const truncateTextNode = /** @type {TruncateText} */ (canvasElement.querySelector('truncate-text'));
    return { canvas, truncateTextNode };
}

/**
 * Generates argTypes for the TruncateText component.
 * @param {string} [category='TruncateText Props'] - The category for the argTypes in the Storybook table.
 * @returns {import('@storybook/web-components-vite').ArgTypes} The generated argTypes for the TruncateText component.
 */
export const getArgTypes = (category = 'TruncateText Props') => ({
    maxLength: { control: { type: 'number' }, table: { category } },
    threshold: { control: { type: 'number' }, table: { category } },
    ellipsis: { control: { type: 'text' }, table: { category } },
    text: { control: { type: 'text' }, table: { category } },
    readLessLabel: { control: { type: 'text' }, table: { category } },
    readMoreLabel: { control: { type: 'text' }, table: { category } },
    hasButton: { control: { type: 'boolean' }, table: { category } }
});
