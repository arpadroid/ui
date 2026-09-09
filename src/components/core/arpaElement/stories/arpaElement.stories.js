/**
 * @typedef {import('../arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaElementConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaElementConfigType>} Story
 */
import { expect, waitFor } from 'storybook/test';
import ArpaElement from '../arpaElement';
import TestElement from './testElement.js';
import { I18n } from '@arpadroid/i18n';

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
            <arpa-element class-name="testComponent" class-names="class1,class2" id="test-element" class="test-element">
                <template template-type="content"> ${TEMPLATE} </template>
                ArpaElement content
            </arpa-element>

            <!-- Although we would normally create a class that extends ArpaElement
            and return a default config from getDefaultConfig, we can also set the
            config programmatically on the element in the following way. -->

            <script>
                var element = /** @type {ArpaElement} */ (document.getElementById('test-element'));
                element.setConfig({
                    attributes: {
                        'data-test': 'testValue'
                    },
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
            expect(element).toHaveClass('testComponent');
            expect(element).toHaveClass('class1');
            expect(element).toHaveClass('class2');
        });

        await step('applies attributes', async () => {
            expect(element).toHaveAttribute('id', 'test-element');
            expect(element).toHaveAttribute('data-test', 'testValue');
        });
    }
};

/** @type {Story} */
export const ArpaElementZones = {
    name: 'ArpaElement - Zones',
    render: () => {
        return html`
            <arpa-element class="testComponent test-element-zones">
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

                expect(headerZone.closest('.testComponent__header')).toBeInTheDocument();
                expect(footerZone.closest('.testComponent__footer')).toBeInTheDocument();
                expect(bodyZone.closest('.testComponent__body')).toBeInTheDocument();
            });
        });

        await step('renders the zones', async () => {
            expect(canvas.getByText('Test Variable 1')).toBeInTheDocument();
            expect(canvas.getByText('Test Variable 2')).toBeInTheDocument();
        });
    }
};

/** @type {Story} */
export const TestElementRender = {
    name: 'TestElement - Render',
    render: () => {
        return html`<test-element class="custom-template">
            <arpa-zone name="header"> Test header </arpa-zone>
            <arpa-zone name="externalWrapper" prepend-content>Test external</arpa-zone>
            <h3>Body Content</h3>
        </test-element>`;
    },
    play: async ({ canvas, canvasElement, step }) => {
        await customElements.whenDefined('test-element');
        const element = /** @type {TestElement} */ (canvasElement.querySelector('test-element'));
        await element?.promise;
        await step('renders the custom template content', async () => {
            await waitFor(() => {
                expect(canvas.getByRole('heading', { name: /Test element/i })).toBeInTheDocument();
                const text = I18n.getText('ui.arpaElement.docs.description.component');
                expect(canvas.getByText(text)).toBeInTheDocument();
                expect(canvas.getByText('Test header')).toBeInTheDocument();
                expect(canvas.getByText('Test external')).toBeInTheDocument();
                expect(canvas.getByText('External wrapper')).toBeInTheDocument();
                expect(canvas.getByText('Body Content')).toBeInTheDocument();
            });
        });
    }
};

/** @type {Story} */
export const TestElementCustomTemplate = {
    name: 'TestElement - Custom Template',
    args: {},
    render: () => {
        return html`<test-element>
            <!-- You can define a custom template using the template-type="content" attribute. -->
            <!-- This allows you to control the entire structure of the component. -->
            <template template-type="content">
                <fieldset>
                    <legend>
                        <h2>Using Custom Templates</h2>
                        <span>Every arpa-element can be overridden with a custom template.</span>
                    </legend>
                    {body}{header}
                    <arpa-zone name="header">
                        <p>Header Template Content</p>
                    </arpa-zone>
                </fieldset>
            </template>
            <arpa-zone name="body">
                <h4>Use arpa-nodes to conveniently re-configure components.</h4>
                <i18n-text key="ui.arpaElement.docs.description.component"></i18n-text>
            </arpa-zone>
            <arpa-zone name="header">
                <span>Header Implementation Content</span>
            </arpa-zone>
        </test-element>`;
    },
    play: async ({ canvas, canvasElement, step }) => {
        await customElements.whenDefined('test-element');
        const element = /** @type {TestElement} */ (canvasElement.querySelector('test-element'));
        await element?.promise;
        await step('renders the custom template content', async () => {
            await waitFor(() => {
                const bodyContent = canvas.getByText(
                    'Use arpa-nodes to conveniently re-configure components.'
                );
                expect(canvas.getByRole('heading', { name: /Using Custom Template/i })).toBeInTheDocument();

                expect(
                    canvas.getByText('Every arpa-element can be overridden with a custom template.')
                ).toBeInTheDocument();
                expect(canvas.getByText('Header Template Content')).toBeInTheDocument();
                expect(canvas.getByText('Header Implementation Content')).toBeInTheDocument();
                expect(bodyContent).toBeInTheDocument();
                expect(bodyContent.parentElement).toHaveClass('testComponent__body');
                expect(bodyContent.parentElement?.tagName).toBe('MAIN');
            });
        });
    }
};

export default ArpaElementStory;
