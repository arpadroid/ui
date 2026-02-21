/**
 * @typedef {import('@storybook/web-components-vite').ArgTypes} ArgTypes
 * @typedef {import('./tooltip').default} Tooltip
 */
import { within } from 'storybook/test';

/**
 * Returns the argTypes for the Tooltip component.
 * @param {string} [category='Tooltip Props'] - The category for the argTypes in the Storybook table.
 * @returns {ArgTypes} The generated argTypes for the Tooltip component.
 */
export function getArgTypes(category = 'Tooltip Props') {
    return {
        text: { control: { type: 'text' }, table: { category } },
        handler: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        label: { control: { type: 'text' }, table: { category } },
        position: {
            control: { type: 'select' },
            options: ['top', 'right', 'bottom', 'left'],
            table: { category }
        }
    };
}

/**
 * Sets up the testing environment for the Tooltip component.
 * @param {HTMLElement} canvasElement - The canvas element containing the tooltip component.
 * @returns {Promise<{canvas: any, tooltipNode: Tooltip}>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    await customElements.whenDefined('arpa-tooltip');
    const tooltipNode = /** @type {Tooltip} */ (canvasElement.querySelector('arpa-tooltip'));
    return { canvas, tooltipNode };
}
