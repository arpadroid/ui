/**
 * @typedef {import('../arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaElementConfigType>} Meta
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaElementConfigType>} Story
 */
import { expect, waitFor, userEvent, fn } from 'storybook/test';
import TestElement from './testElement.js';
import './testComponent.js';
import { I18n } from '@arpadroid/i18n';

const html = String.raw;

/** @type {Meta} */
const TestElementStory = {
    title: 'UI/Core/TestElement',
    component: 'test-element',
    render: () => {
        return html`<test-element class="custom-template">
            <arpa-zone name="legend">
                <p>
                    <i18n-text key="ui.arpaElement.docs.description.component"></i18n-text>
                </p>
            </arpa-zone>
            <arpa-zone name="header"><h3>Test header</h3></arpa-zone>
            Body Content
            <arpa-zone name="externalWrapper" prepend-content>Zone external</arpa-zone>
        </test-element>`;
    }
};

export default TestElementStory;

/** @type {Story} */
export const TestElementRender = {
    name: 'TestElement - Render',

    play: async ({ canvas, canvasElement, step }) => {
        await customElements.whenDefined('test-element');
        const element = /** @type {TestElement} */ (canvasElement.querySelector('test-element'));
        await element?.promise;
        const onCtaClick = fn();
        element._config.onCtaClick = onCtaClick;

        await step('renders the custom template content', async () => {
            await waitFor(() => {
                expect(canvas.getByRole('heading', { name: /Test element/i })).toBeInTheDocument();
                const text = I18n.getText('ui.arpaElement.docs.description.component');
                expect(canvas.getByText(text)).toBeInTheDocument();
                expect(canvas.getByText('Test header')).toBeInTheDocument();
                expect(canvas.getByText('Zone external')).toBeInTheDocument();
                expect(canvas.getByText('External wrapper')).toBeInTheDocument();
                expect(canvas.getByText('Body Content')).toBeInTheDocument();
            });
        });

        await step('tests ctas', async () => {
            const buttons = /** @type {HTMLButtonElement[]} */ (canvas.getAllByRole('button'));
            expect(buttons.length).toBe(2);
            expect(buttons[0]).toBeInTheDocument();
            expect(buttons[1]).toBeInTheDocument();
            await userEvent.click(buttons[0]);
            expect(onCtaClick).toHaveBeenCalledOnce();
            await userEvent.click(buttons[1]);
            expect(onCtaClick).toHaveBeenCalledTimes(2);
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
                        {ctas}
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
                <span>Header Zone Content</span>
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
                expect(canvas.getByText('Header Zone Content')).toBeInTheDocument();
                expect(bodyContent).toBeInTheDocument();
                expect(bodyContent.parentElement).toHaveClass('testElement__body');
                expect(bodyContent.parentElement?.tagName).toBe('MAIN');
            });
        });
    }
};
