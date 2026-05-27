/**
 * @typedef {import('../arpaNode.types.js').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import('../arpaNode.js').default} ArpaNode
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaNodeConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaNodeConfigType>} StoryObj
 */

import { expect, waitFor } from 'storybook/test';
import './testElement.js';
import '../arpaNode.js';

const html = String.raw;

/** @type {Meta} */
const ArpaNodeStory = {
    title: 'UI/Core/ArpaNode',
    component: 'arpa-node'
};

export default ArpaNodeStory;

/**
 * Renders a test element with various zones to demonstrate the functionality of ArpaNode.
 * @returns {string} The HTML string to render the test element.
 */
function renderWithZones() {
    return html`
        <style>
            test-element,
            test-element main {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
        </style>
        <test-element external-content="Custom content" aside="Aside -> Attribute">
            <zone name="header">
                <span>Header -> Zone</span>
            </zone>
            <zone name="content">
                <span>Content -> Zone</span>
            </zone>
            <zone name="aside">
                <span>Aside -> Zone</span>
            </zone>
        </test-element>
    `;
}

/** @type {StoryObj} */
export const Default = {
    name: 'Render',
    render: renderWithZones
};

/**
 * Sets up the test environment by waiting for the custom elements to be defined.
 * @returns {Promise<void>}
 */
async function playSetup() {
    await customElements.whenDefined('test-element');
    await customElements.whenDefined('arpa-node');
}

/**
 * Asserts that no arpa-node elements are present in the given element.
 * @param {HTMLElement} element - The element to check for arpa-node elements.
 */
function assertNoArpaNodes(element) {
    const nodes = element.querySelectorAll('arpa-node');
    expect(nodes.length).toBe(0);
}

/** @type {StoryObj} */
export const Test = {
    args: {},
    render: renderWithZones,

    play: async ({ canvasElement, canvas, step }) => {
        await playSetup();
        await step('Does not render arpa-nodes', async () => {
            await waitFor(() => assertNoArpaNodes(canvasElement));
        });

        await step('Renders the zoned content', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Header -> Zone')).toBeInTheDocument();
                expect(canvas.getByText('Content -> Zone')).toBeInTheDocument();
                expect(canvas.getByText('Aside -> Zone')).toBeInTheDocument();
            });
        });

        await step('Renders static content', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Header -> Static')).toBeInTheDocument();
                expect(canvas.getByText('Main -> Static')).toBeInTheDocument();
                expect(canvas.getByText('Content -> Static')).toBeInTheDocument();
                expect(canvas.getByText('Footer -> Static')).toBeInTheDocument();
            });
        });

        await step('Renders attribute content', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Aside -> Attribute')).toBeInTheDocument();
            });
        });

        await step('Renders config content', async () => {
            await waitFor(() => {
                expect(canvas.getByText('Header -> Config')).toBeInTheDocument();
            });
        });
    }
};

/** @type {StoryObj} */
export const NoZones = {
    render: () => {
        return html`
            <style>
                test-element,
                test-element main {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
            </style>
            <test-element external-content="Custom content"></test-element>
        `;
    },
    play: async ({ canvasElement, step }) => {
        await playSetup();
        await step('Does not render arpa-nodes', async () => {
            await waitFor(() => assertNoArpaNodes(canvasElement));
        });
    }
};

/** @type {StoryObj} */
export const Programmatic = {
    args: {
        tag: 'h1',
        name: 'programmatic',
        canRender: true,
        content: 'Programmatic content'
    },
    decorators: [
        Story => {
            const wrapper = document.createElement('arpa-element');
            wrapper.className = 'my-wrapper';
            const storyElement = Story();
            customElements.whenDefined('arpa-element').then(() => {
                // @ts-ignore
                wrapper?.appendChild(storyElement);
            });
            return wrapper;
        }
    ],
    play: async ({ canvasElement, canvas, step }) => {
        await playSetup();
        await step('Does not render arpa-nodes', async () => {
            await waitFor(() => assertNoArpaNodes(canvasElement));
            expect(
                canvas.getByRole('heading', { name: 'Programmatic content', level: 1 })
            ).toBeInTheDocument();
        });
    }
};
