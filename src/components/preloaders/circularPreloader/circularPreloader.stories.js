/**
 * @typedef {import('./circularPreloader').default} CircularPreloader
 * @typedef {import('./circularPreloader.types').CircularPreloaderConfigType} CircularPreloaderConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<CircularPreloaderConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<CircularPreloaderConfigType>} StoryObj
 */
import { expect } from 'storybook/test';
/** @type {Meta} */
const CircularPreloaderStory = {
    title: 'UI/Preloaders/Circular Preloader',
    tags: [],
    component: 'circular-preloader'
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: {},
    args: {
        label: 'Loading...'
    }
};

/** @type {StoryObj} */
export const Test = {
    ...Default,
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('circular-preloader');
        const preloader = /** @type {CircularPreloader | null} */ (
            canvasElement.querySelector('circular-preloader')
        );
        await step('renders the circular preloader text', async () => {
            expect(preloader).toBeInTheDocument();

            const mask = preloader?.querySelector('.circularPreloader__mask');
            expect(mask).not.toBeInTheDocument();
        });
    }
};

/** @type {StoryObj} */
export const WithMask = {
    ...Default,
    name: 'With Mask',
    args: {
        ...Default.args,
        hasMask: true
    },
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('circular-preloader');
        const preloader = /** @type {CircularPreloader | null} */ (
            canvasElement.querySelector('circular-preloader')
        );
        await step('renders the circular preloader with mask', async () => {
            expect(preloader).toBeInTheDocument();
            const mask = preloader?.querySelector('.circularPreloader__mask');
            expect(mask).toBeInTheDocument();
        });
    }
};

export default CircularPreloaderStory;
