/**
 * @typedef {import('./circularPreloader.types').CircularPreloaderConfigType} CircularPreloaderConfigType
 * @typedef {import('./circularPreloader').default} CircularPreloader
 * @typedef {import('@storybook/web-components-vite').ArgTypes} ArgTypes
 */

import { within } from 'storybook/test';

/**
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{canvas: any, preloader: CircularPreloader | null}>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    await customElements.whenDefined('circular-preloader');
    const preloader = /** @type {CircularPreloader | null} */ (
        canvasElement.querySelector('circular-preloader')
    );
    return { canvas, preloader };
}

/**
 * Returns the argTypes for the CircularPreloader component.
 * @param {string} [category='Circular Preloader Props'] - The category for the argTypes in the Storybook table.
 * @returns {ArgTypes} The generated argTypes for the CircularPreloader component.
 */
export function getArgTypes(category = 'Circular Preloader Props') {
    return {
        size: {
            control: { type: 'select' },
            options: ['mini', 'small', 'medium', 'big'],
            table: { category }
        },
        variant: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'tertiary'],
            table: { category }
        },
        text: { control: { type: 'text' }, table: { category } },
        content: { control: { type: 'text' }, table: { category: 'Content' } }
    };
}

/**
 * Returns the default args for the CircularPreloader component.
 * @returns {CircularPreloaderConfigType & {content: string}} The default args for the CircularPreloader component.
 */
export function getArgs() {
    return {
        text: '',
        content: ''
    };
}
