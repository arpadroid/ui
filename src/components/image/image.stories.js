/**
 * @typedef {import('@storybook/web-components-vite').Meta} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj} StoryObj
 * @typedef {import('@storybook/web-components-vite').Args} Args
 * @typedef {import('@storybook/web-components-vite').StoryContext} StoryContext
 */

import { attrString } from '@arpadroid/tools';
import { waitFor, expect, within } from 'storybook/test';
import { getArgs, getArgTypes, playSetup } from './image.stories.util';
const html = String.raw;

/** @type {Meta} */
const ImageStory = {
    title: 'UI/Components/Image',
    tags: [],
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

/** @type {StoryObj} */
export const Default = {
    name: 'Squared',
    parameters: {},
    argTypes: getArgTypes(),
    args: { ...getArgs(), size: 400, caption: 'Image caption' }
};

/** @type {StoryObj} */
export const Portrait = {
    // name: 'Portrait Image',
    parameters: {
        layout: 'centered'
    },
    argTypes: getArgTypes(),
    args: {
        ...getArgs(),
        src: '/test-assets/space/earth-vertical-400.jpg',
        width: 270,
        height: 400
    }
};

/** @type {StoryObj} */
export const Landscape = {
    parameters: {},
    argTypes: getArgTypes(),
    args: {
        ...getArgs(),
        src: '/test-assets/space/sun-earth-moon-400.jpg',
        width: 320,
        height: 144
    }
};

/** @type {StoryObj} */
export const mini = {
    parameters: {},
    argTypes: getArgTypes(),
    args: {
        ...getArgs(),
        src: '/test-assets/space/black-hole-75.jpg',
        size: 30
    }
};

/** @type {StoryObj} */
export const small = {
    parameters: {},
    argTypes: getArgTypes(),
    args: {
        ...getArgs(),
        src: '/test-assets/space/black-hole-200.jpg',
        size: 100
    }
};

/** @type {StoryObj} */
export const NoImage = {
    name: 'No Image',
    parameters: {},
    argTypes: getArgTypes(),
    args: { ...getArgs(), src: '' }
};

/** @type {StoryObj} */
export const NotFoundImage = {
    name: 'Not Found Image',
    parameters: {},
    argTypes: getArgTypes(),
    args: {
        ...getArgs(),
        src: '/test-assets/space/this-image-does-not-exist.jpg'
    }
};

/** @type {StoryObj} */
export const WithPreview = {
    name: 'With Preview',
    parameters: {},
    argTypes: getArgTypes(),
    args: {
        ...getArgs(),
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
    play: async ({ canvasElement, step }) => {
        const setup = await playSetup(canvasElement);
        const { preloader } = setup;
        await step('renders the image preloader text', async () => {
            await waitFor(() => expect(preloader).not.toBeNull());
        });
    }
};

export default ImageStory;
