/**
 * @typedef {import('./arpaElement').default} ArpaElement
 * @typedef {import('./arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 * @typedef {import('@storybook/web-components-vite').Meta<ArpaElementConfigType>} ArpaElementMetaType
 * @typedef {import('@storybook/web-components-vite').StoryObj<ArpaElementConfigType>} ArpaElementStoryType
 */
import { expect } from 'storybook/test';

const html = String.raw;
/** @type {ArpaElementMetaType} */
const ArpaElementStory = {
    title: 'UI/ArpaElement',
    component: 'arpa-element',
    args: {
        className: 'arpa-element',
        variant: ''
    }
};

/** @type {ArpaElementStoryType} */
export const Default = {
    name: 'Render',
    args: {
        content: html`<p>ArpaElement content</p>`
    }
};

/** @type {ArpaElementStoryType} */
export const Zones = {
    name: 'Zones',
    args: {
        templateChildren: {
            header: {
                tag: 'header',
                content: html`<p>Header Zone Content</p>`
            },
            body: {
                tag: 'main',
                content: html`<p>Body Zone Content</p>`
            },
            footer: {
                tag: 'footer',
                content: html`<p>Footer Zone Content</p>`
            }
        },
        template: html`{header}{body} custom content {footer}`,
        
        content: html`<zone name="footer"><p>footer custom content</p></zone>`
    },
    play: async ({ step, canvas }) => {
        await step('renders the zones', async () => {
            const headerZone = canvas.getByText('Header Zone Content');
            const bodyZone = canvas.getByText('Body Zone Content');
            const footerZone = canvas.getByText('Footer Zone Content');
            
            expect(headerZone).toBeInTheDocument();
            expect(headerZone.parentNode).toHaveClass('arpa-element__header');

            expect(bodyZone).toBeInTheDocument();
            expect(bodyZone.parentNode).toHaveClass('arpa-element__body');

            expect(footerZone).toBeInTheDocument();
            expect(footerZone.parentNode).toHaveClass('arpa-element__footer');
            expect(canvas.getByText('custom content')).toBeInTheDocument();
        });
    }
};

export default ArpaElementStory;
