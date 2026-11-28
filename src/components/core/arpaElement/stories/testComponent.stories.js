/**
 * @typedef {import('../arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaElementConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaElementConfigType>} Story
 */

import TestComponent from './testComponent.js';
import './testElement.js';
import { expect, fn } from 'storybook/test';

const html = String.raw;

/** @type {Meta} */
const TestElementStory = {
    title: 'UI/Core/TestComponent',
    component: 'test-component'
};

export default TestElementStory;

/** @type {Story} */
export const Render = {
    render: () => {
        return html`<test-component>
            <test-element
                $on-ctaclick="{onCta1Click}"
                title="Element 3"
                primary-label="CTA 5"
                secondary-label="CTA 6"
            >
                Tertiary Content
            </test-element>
        </test-component>`;
    },
    play: async ({ canvas, canvasElement, step }) => {
        await customElements.whenDefined('test-component');
        const element = /** @type {TestComponent} */ (canvasElement.querySelector('test-component'));
        await element?.promise;
        const onCta1Click = fn();
        const onCta2Click = fn();
        element.setConfig({ onCta1Click, onCta2Click });
        await step('renders the test component', async () => {
            expect(canvas.getByText('Element 1')).toBeInTheDocument();
            expect(canvas.getByText('Element 2')).toBeInTheDocument();
            expect(canvas.getByText('Element 3')).toBeInTheDocument();
            expect(canvas.getByText('Primary Content')).toBeInTheDocument();
            expect(canvas.getByText('Secondary Content')).toBeInTheDocument();
            expect(canvas.getByText('Tertiary Content')).toBeInTheDocument();
        });
    }
};
