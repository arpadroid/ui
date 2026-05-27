/**
 * @typedef {import('./image.types').ImageConfigType} ImageConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ImageConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ImageConfigType>} StoryObj
 */

import { attrString } from '@arpadroid/tools';
import { waitFor, expect } from 'storybook/test';
import { playSetup } from './image.stories.util';
const html = String.raw;

/** @type {Meta} */
const ImageStory = {
    title: 'UI/Image',
    tags: [],
    component: 'arpa-image',
    render: args => {
        return html`
            <style>
                #storybook-root {
                    height: 100%;
                    width: 100%;
                    max-height: 100%;
                    overflow: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>

            <arpa-image ${attrString(args)}>${args.content}</arpa-image>
        `;
    }
};

const sources = {
    square: '/test-assets/space/earth-vertical-400.jpg',
    portrait: '/test-assets/space/earth-vertical-400.jpg',
    landscape: '/test-assets/space/sun-earth-moon-400.jpg',
    mini: '/test-assets/space/black-hole-75.jpg',
    small: '/test-assets/space/black-hole-200.jpg',
    notFound: '/test-assets/space/this-image-does-not-exist.jpg',
    withPreview: '/test-assets/space/moon-[width].jpg'
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
        src: sources.notFound
    }
};

/** @type {StoryObj} */
export const WithPreview = {
    name: 'With Preview',
    args: {
        src: sources.withPreview,
        width: 400,
        height: 400,
        showPreloader: true,
        hasPreview: true
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
    }
};

export default ImageStory;
