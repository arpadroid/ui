/**
 * @typedef {import('./image.js').default} ArpaImageComponent
 * @typedef {import('./image.types').ImageConfigType} ImageConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ImageConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ImageConfigType>} StoryObj
 */

import { attrString } from '@arpadroid/tools';
import { waitFor, expect } from 'storybook/test';
const html = String.raw;

/** @type {Meta} */
const ImageStory = {
    title: 'UI/Image',
    tags: [],
    component: 'arpa-image'
};

const sources = {
    square: '/test-assets/space/earth-vertical-400.jpg',
    portrait: '/test-assets/space/earth-vertical-400.jpg',
    landscape: '/test-assets/space/sun-earth-moon-400.jpg',
    mini: '/test-assets/space/black-hole-75.jpg',
    small: '/test-assets/space/black-hole-200.jpg',
    notFound: '/test-assets/space/this-image-does-not-exist.jpg',
    withPreview: '/test-assets/space/moon-400.jpg',
    withPreviewHighRes: '/test-assets/space/moon-800.jpg'
};

/** @type {StoryObj} */
export const Default = {
    name: 'Squared',
    parameters: {},
    args: {
        size: 400,
        src: sources.square,

        caption: 'Image caption'
    }
};

/**
 * Sets up the testing environment for the Image component.
 * @param {HTMLElement} canvasElement
 * @returns {Promise<{preloader: HTMLElement | null, image: ArpaImageComponent | null}>}
 */
async function playSetup(canvasElement) {
    await customElements.whenDefined('arpa-image');
    const image = /** @type {ArpaImageComponent | null} */ (canvasElement.querySelector('arpa-image'));
    const preloader = /** @type {HTMLElement | null} */ (image?.querySelector('circular-spinner'));
    return { preloader, image };
}

/** @type {StoryObj} */
export const Portrait = {
    parameters: {
        layout: 'centered'
    },
    args: {
        src: sources.portrait,
        width: 270,
        height: 400
    }
};

/** @type {StoryObj} */
export const Landscape = {
    args: {
        src: sources.landscape,
        width: 320,
        height: 144
    }
};

/** @type {StoryObj} */
export const mini = {
    args: {
        src: sources.mini,
        size: 30
    }
};

/** @type {StoryObj} */
export const small = {
    args: {
        src: sources.small,
        size: 100
    }
};

/** @type {StoryObj} */
export const NoImage = {
    name: 'No Image',
    args: { src: '' }
};

/** @type {StoryObj} */
export const NotFoundImage = {
    name: 'Not Found Image',
    args: {
        src: sources.notFound,
        size: 200
    }
};

/** @type {StoryObj} */
export const WithPreview = {
    name: 'With Preview',
    args: {
        src: sources.withPreview,
        width: 400,
        height: 400,
        hasPreloader: true,
        hasPreview: true
    }
};

/** @type {StoryObj} */
export const Loading = {
    name: 'Loading State',
    args: {
        src: sources.withPreview,
        width: 400,
        height: 400,
        hasPreloader: true,
        hasPreview: true
    },
    render: args => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html` <arpa-image ${attrString(args)}></arpa-image> `;

        const image = /** @type {ArpaImageComponent | null} */ (wrapper.querySelector('arpa-image'));
        if (image) {
            const originalGetImageAttributes = image.getImageAttributes.bind(image);
            image.getImageAttributes = function () {
                const attributes = originalGetImageAttributes();
                return {
                    ...attributes,
                    src: '',
                    'data-src': ''
                };
            };
        }

        return wrapper;
    },
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { preloader, image } = setup;

        await step('shows the preloader while loading', async () => {
            await waitFor(() => {
                expect(image?.hasLoaded()).toBe(false);
                expect(preloader).not.toBeNull();
            });
        });
    }
};

/** @type {StoryObj} */
export const Test = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { preloader } = setup;
        await step('renders the image preloader text', async () => {
            await waitFor(() => expect(preloader).not.toBeNull());
        });

        await step('renders the image', async () => {
            const image = /** @type {ArpaImageComponent | null} */ (
                canvasElement.querySelector('arpa-image')
            );
            await waitFor(() => expect(image?.hasLoaded()).toBe(true));
        });
    }
};

export default ImageStory;
