import { defineCustomElement } from '@arpadroid/tools';
import ArpaElement from '../../arpaElement/arpaElement.js';

const html = String.raw;
class TestElement extends ArpaElement {
    getDefaultConfig() {
        return {
            className: 'testElement',
            externalContent: 'External content',
            header: html`<span>Header -> Config</span>`,
            aside: '',
        };
    }
    _getTemplate() {
        return html`
            <arpa-node tag="header" name="header">
                <span>Header -> Static</span>
            </arpa-node>
            <div class="testElement__body">
                <arpa-node tag="main" name="main">
                    <span>Main -> Static</span>
                    <arpa-node tag="p" name="content" is-content>
                        <span>Content -> Static</span>
                    </arpa-node>
                </arpa-node>
                <arpa-node tag="aside" name="aside"></arpa-node>
            </div>
            <arpa-node tag="footer" name="footer" some-attr>
                <span>Footer -> Static</span>
            </arpa-node>
        `;
    }
}

defineCustomElement('test-element', TestElement);

export default TestElement;
