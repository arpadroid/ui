/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').Args} Args
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */

import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
const html = String.raw;

/** @type {Meta} */
const ImageStory = {
    title: 'UI/Components/Image',
    tags: [],
    getArgs: () => ({
        src: '/test-assets/space/earth-square-400.jpg',
        alt: '',
        quality: 80,

        icon: 'crop_original',
        lazyLoad: false,
        hasDropArea: false
    }),
    getArgTypes: (category = 'Image Props') => ({
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
    }),
    render: (/** @type {Args} */ args) => {
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

/** @type {StoryObj} */
export const Default = {
    name: 'Squared',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: { ...ImageStory.getArgs(), size: 400, caption: 'Image caption' }
};

/** @type {StoryObj} */
export const Portrait = {
    // name: 'Portrait Image',
    parameters: {
        layout: 'centered'
    },
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/test-assets/space/earth-vertical-400.jpg',
        width: 270,
        height: 400
    }
};

/** @type {StoryObj} */
export const Landscape = {
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/test-assets/space/sun-earth-moon-400.jpg',
        width: 320,
        height: 144
    }
};

/** @type {StoryObj} */
export const mini = {
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/test-assets/space/black-hole-75.jpg',
        size: 30
    }
};

/** @type {StoryObj} */
export const small = {
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/test-assets/space/black-hole-200.jpg',
        size: 100
    }
};

/** @type {StoryObj} */
export const NoImage = {
    name: 'No Image',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: { ...ImageStory.getArgs(), src: '' }
};

/** @type {StoryObj} */
export const NotFoundImage = {
    name: 'Not Found Image',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/test-assets/space/this-image-does-not-exist.jpg'
    }
};

/** @type {StoryObj} */
export const WithPreview = {
    name: 'With Preview',
    parameters: {},
    argTypes: ImageStory.getArgTypes(),
    args: {
        ...ImageStory.getArgs(),
        src: '/test-assets/space/moon-[width].jpg',
        width: 400,
        height: 400,
        showPreloader: true,
        hasPreview: true
    }
};

/** @type {StoryObj} */
export const Test = {
    ...Default,
    /**
     * @param {HTMLElement} canvasElement
     */
    playSetup: async canvasElement => {
        const canvas = within(canvasElement);
        await customElements.whenDefined('arpa-image');
        const preloader = canvasElement.querySelector('arpa-image');
        return { canvas, preloader };
    },
    play: async (
        /** @type {import('@storybook/web-components-vite').StoryContext} */ { canvasElement, step }
    ) => {
        const setup = await Test.playSetup(canvasElement);
        const { preloader } = setup;
        await step('renders the image preloader text', async () => {
            await waitFor(() => expect(preloader).not.toBeNull());
        });
    }
};

export default ImageStory;
