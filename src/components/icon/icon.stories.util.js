/**
 * @typedef {import('./icon').default} Icon
 * @typedef {import('@storybook/web-components-vite').ArgTypes} ArgTypes
 */

import { within } from 'storybook/test';

/**
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{canvas: ReturnType<typeof within>, iconNode?: Icon | null}>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    await customElements.whenDefined('arpa-icon');
    /** @type {Icon | null} */
    const iconNode = canvasElement.querySelector('arpa-icon');
    return { canvas, iconNode };
}

/**
 * Returns the default args for the Icon component.
 * @returns {{icon: string}} The default args for the Icon component.
 */
export function getArgs() {
    return { icon: 'sailing' };
}

/**
 * Returns the argTypes for the Icon component.
 * @param {string} [category='Icon Props'] - The category for the argTypes in the Storybook table.
 * @returns {ArgTypes} The generated argTypes for the Icon component.
 */
export function getArgTypes(category = 'Icon Props') {
    return {
        icon: { control: { type: 'text' }, table: { category } }
    };
}
