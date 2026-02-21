/**
 * @typedef {import('./pager').default} Pager
 * @typedef {import('./pager.types').PagerConfigType} PagerConfigType
 */

import { within } from 'storybook/test';

/**
 * Setup function for the pager stories.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{canvas: ReturnType<typeof within>, pagerNode: Pager}>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    await customElements.whenDefined('arpa-pager');
    const pagerNode = /** @type {Pager} */ (canvasElement.querySelector('arpa-pager'));
    await pagerNode?.promise;
    return { canvas, pagerNode };
}

/**
 * Returns the argTypes for the pager component.
 * @param {string} [category='Pager Props'] - The category for the argTypes in the Storybook table.
 * @returns {import('@storybook/web-components-vite').ArgTypes} The generated argTypes for the pager component.
 */
export function getArgTypes(category = 'Pager Props') {
    return {
        title: { control: { type: 'text' }, table: { category } },
        className: { control: { type: 'text' }, table: { category } },
        currentPage: { control: { type: 'number' }, table: { category } },
        totalPages: { control: { type: 'number' }, table: { category } },
        maxNodes: { control: { type: 'number' }, table: { category } },
        hasArrowControls: { control: { type: 'boolean' }, table: { category } },
        hasInput: { control: { type: 'boolean' }, table: { category } },
        urlParam: { control: { type: 'text' }, table: { category } }
    };
}

/**
 * Returns the default arguments for the pager stories.
 * @returns {PagerConfigType} The default arguments for the pager stories.
 */
export function getArgs() {
    return {
        className: 'pager',
        currentPage: 2,
        totalPages: 10,
        maxNodes: 7,
        hasArrowControls: true,
        hasInput: false,
        urlParam: 'page'
    };
}
