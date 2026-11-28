/**
 * @typedef {import('../arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaElementConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaElementConfigType>} Story
 */
import { expect, waitFor } from 'storybook/test';
import ArpaElement from '../arpaElement';
import './testComponent.js';

const html = String.raw;

/** @type {Meta} */
const ArpaElementStory = {
    title: 'UI/Core/ArpaElement',
    component: 'arpa-element'
};

const TEMPLATE = html`
    <fieldset>
        <legend>
            <h2>Arpa Element</h2>
            <p>
                <i18n-text key="ui.arpaElement.docs.description.component"></i18n-text>
            </p>
        </legend>

        <arpa-node name="header" tag="header">
            <p>{testVar}</p>
        </arpa-node>

        <arpa-node name="body" tag="main" is-content></arpa-node>

        <arpa-node name="footer" tag="footer"></arpa-node>

        {testVar2}
    </fieldset>
`;

/** @type {Story} */
export const ArpaElementRender = {
    name: 'ArpaElement - Render',
    render: () => {
        return html`
            <arpa-element
                class-name="testElement"
                class-names="class1,class2"
                id="test-element"
                class="test-element"
            >
                <template template-type="content"> ${TEMPLATE} </template>
                ArpaElement content
            </arpa-element>

            <!-- Although we would normally create a class that extends ArpaElement
            and return a default config from getDefaultConfig, we can also set the
            config programmatically on the element in the following way. -->

            <script>
                var element = /** @type {ArpaElement} */ (document.getElementById('test-element'));
                element.setConfig({
                    templateVars: {
                        testVar: () => 'Test Variable 1',
                        testVar2: 'Test Variable 2'
                    }
                });
            </script>
        `;
    },
    play: async ({ step, canvas, canvasElement }) => {
        const element = /** @type {ArpaElement} */ (canvasElement.querySelector('#test-element'));
        await customElements.whenDefined('arpa-element');
        await element.promise;

        await step('renders the content', async () => {
            await waitFor(() => {
                const contentNode = canvas.getByText('ArpaElement content');
                expect(contentNode).toBeInTheDocument();
            });
        });

        await step('applies class names', async () => {
            expect(element).toHaveClass('testElement');
            expect(element).toHaveClass('class1');
            expect(element).toHaveClass('class2');
        });

        await step('applies attributes', async () => {
            expect(element).toHaveAttribute('id', 'test-element');
        });
    }
};

/** @type {Story} */
export const ArpaElementZones = {
    name: 'ArpaElement - Zones',
    render: () => {
        return html`
            <arpa-element class="testElement test-element-zones">
                <template template-type="content">${TEMPLATE}</template>

                <arpa-zone name="header" prepend>
                    <h3>Header Content</h3>
                </arpa-zone>

                <arpa-zone name="body" prepend>
                    <h3>Body Content</h3>
                </arpa-zone>

                <arpa-zone name="footer">
                    <h3>Footer Content</h3>
                </arpa-zone>
            </arpa-element>

            <script>
                var element = /** @type {ArpaElement} */ (document.querySelector('.test-element-zones'));
                element.setConfig({
                    templateVars: {
                        testVar: () => 'Test Variable 1',
                        testVar2: 'Test Variable 2'
                    }
                });
            </script>
        `;
    },
    play: async ({ step, canvas, canvasElement }) => {
        const element = /** @type {ArpaElement} */ (canvasElement.querySelector('.test-element-zones'));
        await element.promise;
        await step('renders the zoned content', async () => {
            await waitFor(() => {
                const headerZone = canvas.getByText('Header Content');
                const bodyZone = canvas.getByText('Body Content');
                const footerZone = canvas.getByText('Footer Content');

                expect(headerZone).toBeInTheDocument();
                expect(bodyZone).toBeInTheDocument();
                expect(footerZone).toBeInTheDocument();

                expect(headerZone.closest('.testElement__header')).toBeInTheDocument();
                expect(footerZone.closest('.testElement__footer')).toBeInTheDocument();
                expect(bodyZone.closest('.testElement__body')).toBeInTheDocument();
            });
        });

        await step('renders the zones', async () => {
            expect(canvas.getByText('Test Variable 1')).toBeInTheDocument();
            expect(canvas.getByText('Test Variable 2')).toBeInTheDocument();
        });
    }
};

export default ArpaElementStory;
