import { defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../arpaElement';

const html = String.raw;

export class TestElement extends ArpaElement {
    getDefaultConfig() {
        return super.getDefaultConfig({
            templateVars: {
                testVar: () => 'Head Content',
                testContent: 'Top Content'
            },
            className: 'testComponent',
            templateChildren: {
                header: {
                    tag: 'header',
                    content: html`<p>{testVar}</p>`
                },
                body: {
                    tag: 'main',
                    isContent: true
                },
                footer: { tag: 'footer' },
                externalWrapper: {
                    tag: 'div',
                    content: html`<p>External wrapper</p>`
                }
            }
        });
    }
}

defineCustomElement('test-element', TestElement);

