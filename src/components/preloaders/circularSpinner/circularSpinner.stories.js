/**
 * @typedef {import('./circularSpinner').default} CircularSpinner
 * @typedef {import('./circularSpinner.types').CircularSpinnerConfigType} CircularSpinnerConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<CircularSpinnerConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<CircularSpinnerConfigType>} StoryObj
 */
import { defaultParams, testParams } from '@arpadroid/module/storybook/helper';
import { attrString } from '@arpadroid/tools';
import { expect } from 'storybook/test';

const html = String.raw;
/** @type {Meta} */
const CircularSpinnerStory = {
    title: 'UI/Preloaders/Circular Spinner',
    tags: [],
    component: 'circular-spinner'
};

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    parameters: defaultParams
};

/** @type {StoryObj} */
export const Mini = {
    parameters: defaultParams,
    args: {
        size: 'mini',
        label: 'loading...'
    }
};

/** @type {StoryObj} */
export const Small = {
    parameters: defaultParams,
    args: {
        size: 'small',
        label: 'loading...'
    }
};

/** @type {StoryObj} */
export const Test = {
    args: {
        label: 'Loading...'
    },
    parameters: testParams,
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('circular-spinner');
        const preloader = /** @type {CircularSpinner | null} */ (
            canvasElement.querySelector('circular-spinner')
        );
        await step('renders the circular preloader text', async () => {
            expect(preloader).toBeInTheDocument();

            const mask = preloader?.querySelector('.circularSpinner__mask');
            expect(mask).not.toBeInTheDocument();
        });
    }
};

/** @type {StoryObj} */
export const WithMask = {
    name: 'With Mask',
    parameters: testParams,
    args: {
        ...Default.args,
        hasMask: true,
        label: 'Loading with mask...'
    },
    play: async ({ canvasElement, step }) => {
        await customElements.whenDefined('circular-spinner');
        /** @type {CircularSpinner | null} */
        const preloader = canvasElement.querySelector('circular-spinner');
        await step('renders the circular preloader with mask', async () => {
            expect(preloader).toBeInTheDocument();
            const mask = preloader?.querySelector('.circularSpinner__mask');
            expect(mask).toBeInTheDocument();
        });
    }
};

/** @type {StoryObj} */
export const CustomContent = {
    args: {
        size: 'x-large',
        thickness: 'thin',
    },
    parameters: testParams,
    render: args => {
        return html`<circular-spinner ${attrString(args)}>
            <arpa-zone name="spinnerContainer">
                <arpa-icon>rocket_launch</arpa-icon>
            </arpa-zone>
            <arpa-zone name="label">Please wait.</arpa-zone>
        </circular-spinner>`;
    },
    play: async ({ canvas, step }) => {
        await customElements.whenDefined('circular-spinner');
        await step('renders the circular preloader with mask', async () => {
            expect(canvas.getByText('Please wait.')).toBeInTheDocument();
            expect(canvas.getByText('rocket_launch')).toBeInTheDocument();
        });
    }
};

export default CircularSpinnerStory;
