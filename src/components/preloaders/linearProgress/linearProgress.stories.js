 /**
 * @typedef {import('./linearProgress').default} LinearProgress
 * @typedef {import('./linearProgress.types').LinearProgressConfigType} LinearProgressConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<LinearProgressConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<LinearProgressConfigType>} StoryObj
 */
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import { expect } from 'storybook/test';

/** @type {Meta} */
const LinearProgressStory = {
    title: 'UI/Preloaders/Linear Progress',
    tags: [],
    component: 'linear-progress',
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
        progress: 60
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
        label: 'Uploading...',
        progress: 40
    }
};

/** @type {StoryObj} */
export const Test = {
    args: {
        progress: 50,
        label: 'Syncing...'
    },
    parameters: testParams,
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('linear-progress');
        const component = /** @type {LinearProgress | null} */ (
            canvasElement.querySelector('linear-progress')
        );

        await step('renders the linear progress component', async () => {
            expect(component).toBeInTheDocument();
        });

        await step('displays the correct percentage', async () => {
            const percentage = component?.querySelector('.linearProgress__percentage');
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
            const percentage = component?.querySelector('.linearProgress__percentage');
            const fill = component?.querySelector('.linearProgress__fill');
            expect(percentage?.textContent).toBe('80%');
            expect(fill instanceof HTMLElement ? fill.style.width : '').toBe('80%');
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
        progress: 100,
        size: 'large',
        label: 'Done'
    }
};

export default LinearProgressStory;