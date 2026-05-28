/**
 * @typedef {import('./arpaFragment.types').ArpaFragmentConfigType} ArpaFragmentConfigType
 * @typedef {import('../arpaNode/arpaNode').default} ArpaNode
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaFragmentConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaFragmentConfigType>} Story
 */
import { expect, waitFor } from 'storybook/test';

const html = String.raw;

/** @type {Meta} */
const ArpaFragmentStory = {
    title: 'UI/Core/ArpaFragment',
    component: 'arpa-frag'
};

export default ArpaFragmentStory;

/**
 * Renders a test element with various zones to demonstrate the functionality of ArpaFragment.
 * @returns {string} The HTML string to render the test element.
 */
function renderFragment() {
    return html`
        <test-node>
            <template template-type="content">
                <arpa-frag name="my-fragment">Fragment Content</arpa-frag>
            </template>
        </test-node>
    `;
}

/** @type {Story} */
export const Render = {
    render: renderFragment
};

/** @type {Story} */
export const Test = {
    render: renderFragment,
    play: async ({ step, canvas, canvasElement }) => {
        await customElements.whenDefined('test-node');
        await step('Renders the fragment', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Fragment Content')).toBeInTheDocument();
            });
        });

        await step('Does not render arpa-frag directly', async () => {
            expect(canvasElement.querySelector('arpa-frag')).toBeNull();
        });

        await step('Checks wrapper component only has fragment content', async () => {
            const wrapper = canvasElement.querySelector('test-node');
            expect(wrapper).toBeInTheDocument();
            expect(wrapper?.textContent).toBe('Fragment Content');
            expect(wrapper?.innerHTML).toBe('Fragment Content');
        });
    }
};

/** @type {Story} */
export const TestMultiple = {
    render: () => html`
        <test-node>
            <template template-type="content">
                <arpa-frag name="my-fragment">
                    <h2>Fragment 1</h2>
                    <p>content 1</p>
                </arpa-frag>

                <arpa-frag name="my-other-fragment">
                    <h2>Fragment 2</h2>
                    <p>content 2</p>
                </arpa-frag>
            </template>
        </test-node>
    `,
    play: async ({ step, canvas, canvasElement }) => {
        await customElements.whenDefined('test-node');
        const testNode = canvasElement.querySelector('test-node');
        await step('Renders multiple items in the fragments', async () => {
            await waitFor(() => {
                const heading1 = canvas.getByRole('heading', { name: 'Fragment 1' });
                expect(heading1).toBeInTheDocument();
                expect(heading1.nextElementSibling?.textContent).toBe('content 1');
                expect(heading1.parentElement).toBe(testNode);

                const content1 = canvas.getByText('content 1');
                expect(content1).toBeInTheDocument();
                expect(content1.previousElementSibling?.textContent).toBe('Fragment 1');
                expect(content1.nextElementSibling?.textContent).toBe('Fragment 2');

                expect(content1.parentElement).toBe(testNode);

                const heading2 = canvas.getByRole('heading', { name: 'Fragment 2' });
                expect(heading2).toBeInTheDocument();
                expect(heading2.nextElementSibling?.textContent).toBe('content 2');
                expect(heading2.parentElement).toBe(testNode);

                const content2 = canvas.getByText('content 2');
                expect(content2).toBeInTheDocument();
                expect(content2.previousElementSibling?.textContent).toBe('Fragment 2');
                expect(content2.parentElement).toBe(testNode);
            });
        });
    }
};
