/**
 * @typedef {import('../arpaZone.types.js').ArpaZoneConfigType} ArpaZoneConfigType
 * @typedef {import('../arpaZone.js').default} ArpaZone
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaZoneConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaZoneConfigType>} Story
 */
import { expect, waitFor } from 'storybook/test';

const html = String.raw;

/** @type {Meta} */
const ArpaZoneStory = {
    title: 'UI/Core/ArpaZone',
    component: 'arpa-zone'
};

export default ArpaZoneStory;

/**
 * Renders a test element with various zones to demonstrate the functionality of ArpaNode.
 * @returns {string} The HTML string to render the test element.
 */
function render() {
    return html`
        <test-node header="">
            <arpa-zone name="header">
                <span>Header -> Zone</span>
            </arpa-zone>
            <arpa-zone name="main">
                <span>Main -> Zone</span>
            </arpa-zone>
            <arpa-zone name="content">
                <span>Content -> Zone</span>
            </arpa-zone>
            <arpa-zone name="aside">
                <span>Aside -> Zone</span>
            </arpa-zone>
            <arpa-zone name="footer">
                <span>Footer -> Zone</span>
            </arpa-zone>
        </test-node>
    `;
}

/** @type {Story} */
export const Render = {
    render
};

/** @type {Story} */
export const Test = {
    render,
    play: async ({ canvas, step }) => {
        await step('Renders the zone content', async () => {
            await waitFor(() => {
                const headerContent = canvas.getByText('Header -> Zone');
                const mainContent = canvas.getByText('Main -> Zone');
                const contentContent = canvas.getByText('Content -> Zone');
                const asideContent = canvas.getByText('Aside -> Zone');
                const footerContent = canvas.getByText('Footer -> Zone');
                expect(headerContent).toBeInTheDocument();
                expect(mainContent).toBeInTheDocument();
                expect(contentContent).toBeInTheDocument();
                expect(asideContent).toBeInTheDocument();
                expect(footerContent).toBeInTheDocument();
            });
        });
    }
};
