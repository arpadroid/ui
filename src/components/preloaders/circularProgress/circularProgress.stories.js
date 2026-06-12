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
    play: async ({ canvas, step }) => {
        await customElements.whenDefined('circular-progress');
        const component = /** @type {CircularProgress | null} */ (canvas.getByRole('progressbar'));

        await step('renders the circular progress component', async () => {
            expect(component).toBeInTheDocument();
        });

        await step('displays the correct percentage', async () => {
            expect(canvas.getByText('50%')).toBeInTheDocument();
        });

        await step('has the correct aria attributes', async () => {
            expect(component?.getAttribute('aria-valuenow')).toBe('50');
            expect(component?.getAttribute('aria-valuemin')).toBe('0');
            expect(component?.getAttribute('aria-valuemax')).toBe('100');
            expect(component?.getAttribute('role')).toBe('progressbar');
        });

        await step('updates progress when setProgress is called', async () => {
            component?.setProgress(80);
            expect(canvas.getByText('80%')).toBeInTheDocument();
            expect(component?.getAttribute('aria-valuenow')).toBe('80');
        });
    }
};

/** @type {StoryObj} */
export const SimulateProgress = {
    args: {
        progress: 0,
        label: 'Uploading...'
    },
    parameters: testParams,
    play: async ({ canvas, step }) => {
        await customElements.whenDefined('circular-progress');
        const component = /** @type {CircularProgress | null} */ (canvas.getByRole('progressbar'));
        await step('simulates progress updates over time', async () => {
            expect(component).toBeInTheDocument();
            expect(canvas.getByText('0%')).toBeInTheDocument();
            for (let i = 10; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 50));
                component?.setProgress(i);
                expect(canvas.getByText(`${i}%`)).toBeInTheDocument();
                expect(component?.getAttribute('aria-valuenow')).toBe(String(i));
            }
        });
    }
};

/** @type {StoryObj} */
export const Empty = {
    name: 'No Progress',
    parameters: testParams,
    args: {
        progress: 0
    },
    play: async ({ canvas, step }) => {
        await customElements.whenDefined('circular-progress');
        const component = /** @type {CircularProgress | null} */ (canvas.getByRole('progressbar'));

        await step('renders the circular progress component with 0% progress', async () => {
            expect(component).toBeInTheDocument();
            expect(canvas.getByText('0%')).toBeInTheDocument();
            expect(component?.getAttribute('aria-valuenow')).toBe('0');
        });
    }
};

/** @type {StoryObj} */
export const Complete = {
    name: 'Complete',
    args: {
        progress: 100,
        size: 'large'
    },
    parameters: testParams,
    play: async ({ canvas, step }) => {
        await customElements.whenDefined('circular-progress');
        const component = /** @type {CircularProgress | null} */ (canvas.getByRole('progressbar'));

        await step('renders the circular progress component with 100% progress', async () => {
            expect(component).toBeInTheDocument();
            expect(canvas.getByText('100%')).toBeInTheDocument();
            expect(component?.getAttribute('aria-valuenow')).toBe('100');
        });
    }
};

export default CircularProgressStory;
