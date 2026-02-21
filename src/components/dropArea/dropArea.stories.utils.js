/**
 * @typedef {import('./dropArea').default} DropArea
 * @typedef {import('./dropArea.types').DropAreaConfigType} DropAreaConfigType
 * @typedef {import('@storybook/web-components-vite').ArgTypes} ArgTypes
 */

import { within } from 'storybook/test';

/**
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{canvas: ReturnType<typeof within>, dropAreaNode: DropArea | null}>} The setup for the DropArea component.
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    await customElements.whenDefined('drop-area');
    /** @type {DropArea | null} */
    const dropAreaNode = canvasElement.querySelector('drop-area');
    return { canvas, dropAreaNode };
}

/**
 * Returns the default args for the DropArea component.
 * @returns {DropAreaConfigType} The default args for the DropArea component.
 */
export function getArgs() {
    return {};
}

/**
 * Returns the argTypes for the DropArea component.
 * @param {string} [category='DropArea Props'] - The category for the argTypes in the Storybook table.
 * @return {ArgTypes} The generated argTypes for the DropArea component.
 */
export function getArgTypes(category = 'DropArea Props') {
    return {
        hasInput: { control: { type: 'boolean' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        label: { control: { type: 'text' }, table: { category } }
    };
}
