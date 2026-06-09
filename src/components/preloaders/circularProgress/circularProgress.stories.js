/**
 * @typedef {import('./circularProgress').default} CircularProgress
 * @typedef {import('./circularProgress.types').CircularProgressConfigType} CircularProgressConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<CircularProgressConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<CircularProgressConfigType>} StoryObj
 */
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import { expect } from 'storybook/test';

/** @type {Meta} */
const CircularProgressStory = {
    title: 'UI/Preloaders/Circular Progress',
    tags: [],
    component: 'circular-progress',
    argTypes: {
        progress: {
            control: { type: 'range', min: 0, max: 100, step: 1 }
        }
    }
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    args: {
        progress: 75
    }
};

/** @type {StoryObj} */
export const Mini = {
    parameters: defaultParams,
    args: {
        size: 'mini',
        progress: 25
    }
};

/** @type {StoryObj} */
export const Small = {
    parameters: defaultParams,
    args: {
        size: 'small',
        label: 'loading...',
        progress: 25
    }
};

/** @type {StoryObj} */
export const Test = {
    args: {
        progress: 50,
        label: 'Uploading...'
    },
    parameters: testParams,
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('circular-progress');
        const component = /** @type {CircularProgress | null} */ (
            canvasElement.querySelector('circular-progress')
        );

        await step('renders the circular progress component', async () => {
            expect(component).toBeInTheDocument();
        });

        await step('displays the correct percentage', async () => {
            const percentage = component?.querySelector('.circularProgress__percentage');
            expect(percentage).toBeInTheDocument();
            expect(percentage?.textContent).toBe('50%');
        });

        await step('has the correct aria attributes', async () => {
            expect(component?.getAttribute('aria-valuenow')).toBe('50');
            expect(component?.getAttribute('aria-valuemin')).toBe('0');
            expect(component?.getAttribute('aria-valuemax')).toBe('100');
            expect(component?.getAttribute('role')).toBe('progressbar');
        });

        await step('updates progress when setProgress is called', async () => {
            component?.setProgress(80);
            const percentage = component?.querySelector('.circularProgress__percentage');
            expect(percentage?.textContent).toBe('80%');
            expect(component?.getAttribute('aria-valuenow')).toBe('80');
        });
    }
};

/** @type {StoryObj} */
export const Empty = {
    name: 'No Progress',
    args: {
        progress: 0
    }
};

/** @type {StoryObj} */
export const Complete = {
    name: 'Complete',
    args: {
        progress: 100
    }
};

/** @type {StoryObj} */
export const WithMask = {
    name: 'With Mask',
    args: {
        progress: 60,
        hasMask: true,
        label: 'Loading...'
    }
};

export default CircularProgressStory;
