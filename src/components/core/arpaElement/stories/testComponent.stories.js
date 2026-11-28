/**
 * @typedef {import('../arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaElementConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaElementConfigType>} Story
 */

import TestComponent from './testComponent.js';
import TestElement from './testElement.js';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

const html = String.raw;

/** @type {Meta} */
const TestElementStory = {
    title: 'UI/Core/TestComponent',
    component: 'test-component'
};

export default TestElementStory;

/** @type {Story} */
export const Render = {};

/** @type {Story} */
export const Test = {
    render: () => {
        return html`<test-component>
            <test-element
                $on-ctaclick="{onHasClicked}"
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
        const onHasClicked = fn();
        const onHasClicked2 = fn();
        const onCtaClick = fn();
        element.setConfig({ onHasClicked, onHasClicked2 });
        const testElements = /** @type {TestElement[]} */ ([...element.querySelectorAll('test-element')]);
        testElements.forEach(el => {
            el.setConfig({ onCtaClick });
        });

        await step('renders the test component', async () => {
            expect(canvas.getByText('Element 1')).toBeInTheDocument();
            expect(canvas.getByText('Element 2')).toBeInTheDocument();
            expect(canvas.getByText('Element 3')).toBeInTheDocument();
            expect(canvas.getByText('Primary Content')).toBeInTheDocument();
            expect(canvas.getByText('Secondary Content')).toBeInTheDocument();
            expect(canvas.getByText('Tertiary Content')).toBeInTheDocument();
        });

        await step('Calls expected handlers', async () => {
            const cta1 = canvas.getByRole('button', { name: 'CTA 1' });
            expect(cta1).toBeInTheDocument();
            await userEvent.click(cta1);
            await waitFor(() => {
                expect(onHasClicked).toHaveBeenCalledOnce();
                expect(onCtaClick).toHaveBeenCalledOnce();
                expect(onHasClicked2).not.toHaveBeenCalled();
            });

            const cta3 = canvas.getByRole('button', { name: 'CTA 3' });
            expect(cta3).toBeInTheDocument();
            await userEvent.click(cta3);
            await waitFor(() => {
                expect(onCtaClick).toHaveBeenCalledTimes(2);
                expect(onHasClicked2).toHaveBeenCalled();
                expect(onHasClicked).toHaveBeenCalledTimes(1);
            });

            const cta5 = canvas.getByRole('button', { name: 'CTA 5' });
            expect(cta5).toBeInTheDocument();
            await userEvent.click(cta5);
            await waitFor(() => {
                expect(onCtaClick).toHaveBeenCalledTimes(3);
                expect(onHasClicked2).toHaveBeenCalledTimes(1);
                expect(onHasClicked).toHaveBeenCalledTimes(2);
            });

            const cta4 = canvas.getByRole('button', { name: 'CTA 4' });
            expect(cta4).toBeInTheDocument();
            await userEvent.click(cta4);

            await waitFor(() => {
                expect(onCtaClick).toHaveBeenCalledTimes(4);
                expect(onHasClicked2).toHaveBeenCalledTimes(2);
                expect(onHasClicked).toHaveBeenCalledTimes(2);
            });
        });
    }
};
