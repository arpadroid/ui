/**
 * @typedef {import('../arpaNode.types.js').ArpaNodeConfigType} ArpaNodeConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaNodeConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaNodeConfigType>} StoryObj
 */

import { expect, waitFor } from 'storybook/test';
import { $attr } from '@arpadroid/tools';

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
            test-node,
            test-node main {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
        </style>
        <test-node external-content="Custom content" aside="Aside -> Attribute">
            <arpa-zone name="header">
                <span>Header -> Zone</span>
            </arpa-zone>
            <arpa-zone name="content">
                <span>Content -> Zone</span>
            </arpa-zone>
            <arpa-zone name="aside">
                <span>Aside -> Zone</span>
            </arpa-zone>
        </test-node>
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
    await customElements.whenDefined('test-node');
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
                test-node,
                test-node main {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
            </style>
            <test-node external-content="Custom content"></test-node>
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
    render: () => {
        return html`<arpa-element class="my-wrapper"></arpa-element>`;
    },
    play: async ({ canvasElement, canvas, step, args }) => {
        const arpaElement = canvasElement.querySelector('arpa-element');
        arpaElement && (arpaElement.innerHTML = html`<arpa-node ${$attr(args)}>${args.content}</arpa-node>`);
        await step('Renders programmatic content', async () => {
            expect(arpaElement).toBeInTheDocument();
            expect(arpaElement).toHaveClass('my-wrapper');
            await waitFor(() => assertNoArpaNodes(canvasElement));
            expect(
                canvas.getByRole('heading', { name: 'Programmatic content', level: 1 })
            ).toBeInTheDocument();
        });
    }
};
