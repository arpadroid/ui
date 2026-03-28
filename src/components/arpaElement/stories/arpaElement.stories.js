/**
 * @typedef {import('../arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaElementConfigType>} ArpaElementMetaType
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaElementConfigType>} ArpaElementStoryType
 */
import { expect, waitFor } from 'storybook/test';
import ArpaElement from '../arpaElement';
import Usage from './arpaElement.default.usage';
import { TestElement } from './arpaElement.stories.util';

const html = String.raw;
/** @type {ArpaElementMetaType} */
const ArpaElementStory = {
    title: 'UI/ArpaElement',
    component: 'arpa-element',
    args: {
        className: 'testComponent',
        classNames: ['class1', 'class2'],
        attributes: {
            id: 'testId',
            'data-test': 'testValue'
        },
        variant: '',
        template: html`<fieldset>
            <legend>
                <h2>Arpa Element</h2>
                <p>
                    <i18n-text key="ui.arpaElement.docs.description.component"> </i18n-text>
                </p>
            </legend>
            {wrapper}{header}{body}{footer}{testVar2}{content}
        </fieldset>`,
        templateVars: {
            testVar: () => 'Test Variable 1'
        },
        templateChildren: {
            header: {
                tag: 'header',
                content: html`<p>{testVar}</p>`
            },
            body: {
                tag: 'main',
                isContent: true
            },
            footer: { tag: 'footer' }
        }
    }
};

/** @type {ArpaElementStoryType} */
export const Default = {
    name: 'Render',
    parameters: {
        usage: Usage
    },
    args: {
        content: html`<p>ArpaElement content</p>`
    },
    play: async ({ step, canvas, canvasElement }) => {
        await customElements.whenDefined('arpa-element');
        const element = /** @type {ArpaElement} */ (canvasElement.querySelector('arpa-element'));
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
            expect(element).toHaveAttribute('id', 'testId');
            expect(element).toHaveAttribute('data-test', 'testValue');
        });
    }
};

/** @type {ArpaElementStoryType} */
export const Zones = {
    name: 'Zones',
    args: {
        templateVars: {
            testVar: () => 'Test Variable 1',
            testVar2: 'Test Variable 2'
        },
        content: html`
            <zone name="header" prepend>
                <h3>Header Content</h3>
            </zone>
            <zone name="body" prepend>
                <h3>Body Content</h3>
            </zone>
            <zone name="footer">
                <h3>Footer Content</h3>
            </zone>
        `
    },
    play: async ({ step, canvas, canvasElement }) => {
        await customElements.whenDefined('arpa-element');
        const element = /** @type {ArpaElement} */ (canvasElement.querySelector('arpa-element'));
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

/** @type {ArpaElementStoryType} */
export const CustomTemplate = {
    name: 'Custom Template',
    args: {},

    render: () => {
        return html`<test-element class="custom-template">
            <!-- You can define a custom template using the template-type="content" attribute. -->
            <!-- This allows you to control the entire structure of the component. -->
            <template template-type="content">
                <fieldset>
                    <legend>
                        <h2>Using Custom Templates</h2>
                        <span>{testContent}</span>
                    </legend>
                    {wrapper}{header}{body}{footer}{content}
                    <!-- Variable tokens wrapped in curly braces map to internal component template children and variables. -->
                    <!-- These are defined in the component's getTemplateVars method and templateChildren configuration. -->
                    <!-- Template children provide zone functionality by default, allowing you to target them with zone elements in the story content. -->
                </fieldset>
            </template>
            <!-- Any content in the global scope will be rendered in the body template child since it's marked as isContent -->
            <h3>Body Content</h3>
            <!-- You can also explicitly target the body zone using a zone element -->
            <zone name="header">
                <i18n-text key="ui.arpaElement.docs.description.component"></i18n-text>
            </zone>
        </test-element>`;
    },
    play: async ({ canvas, canvasElement, step }) => {
        await customElements.whenDefined('test-element');
        const element = /** @type {TestElement} */ (canvasElement.querySelector('test-element'));
        await element?.promise;
        await step('renders the custom template content', async () => {
            await waitFor(() => {
                const bodyContent = canvas.getByText('Body Content');
                expect(canvas.getByRole('heading', { name: /Using Custom Template/i })).toBeInTheDocument();
                expect(canvas.getByText('Top Content')).toBeInTheDocument();
                expect(canvas.getByText('Head Content')).toBeInTheDocument();
                expect(bodyContent).toBeInTheDocument();
                expect(bodyContent.parentElement).toHaveClass('testComponent__body');
                expect(bodyContent.parentElement?.tagName).toBe('MAIN');
            });
        });
    }
};

export default ArpaElementStory;
