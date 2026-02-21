/**
 * @typedef {import('@storybook/web-components-vite').ArgTypes} ArgTypes
 * @typedef {import('./image').default} Image
 * @typedef {import('./image.types').ImageConfigType} ImageConfigType
 */
import { within } from 'storybook/test';

export function getArgs() {
    return {
        src: '/test-assets/space/earth-square-400.jpg',
        alt: '',
        quality: 80,
        icon: 'crop_original',
        lazyLoad: false,
        hasDropArea: false
    };
}

/**
 * Returns the argTypes for the Image component.
 * @param {string} [category='Image Props'] - The category for the argTypes in the Storybook table.
 * @returns {ArgTypes} The generated argTypes for the Image component.
 */
export function getArgTypes(category = 'Image Props') {
    return {
        src: { control: { type: 'text' }, table: { category } },
        alt: { control: { type: 'text' }, table: { category } },
        icon: { control: { type: 'text' }, table: { category } },
        caption: { control: { type: 'text' }, table: { category } },
        quality: { control: { type: 'number' }, table: { category } },
        size: { control: { type: 'number' }, table: { category } },
        width: { control: { type: 'number' }, table: { category } },
        height: { control: { type: 'number' }, table: { category } },
        sizes: { control: { type: 'text' }, table: { category } },
        lazyLoad: { control: { type: 'boolean' }, table: { category } },
        showPreloader: { control: { type: 'boolean' }, table: { category } },
        hasDropArea: { control: { type: 'boolean' }, table: { category } }
    };
}

/**
 * Sets up the testing environment for the Image component.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{canvas: any, preloader: Image | null}>}
 */
export async function playSetup(canvasElement) {
    const canvas = within(canvasElement);
    await customElements.whenDefined('arpa-image');
    const preloader = /** @type {Image | null} */ (canvasElement.querySelector('arpa-image'));
    return { canvas, preloader };
}
