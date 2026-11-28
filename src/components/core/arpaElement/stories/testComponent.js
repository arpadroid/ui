import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import ArpaElement from '../arpaElement';

const html = String.raw;

export default class TestComponent extends ArpaElement {
    getDefaultConfig() {
        const conf = {
            className: 'testComponent'
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    $renderTemplate() {
        return html`
            <test-element
                $on-ctaclick="{onCta1Click}"
                title="Element 1"
                primary-label="CTA 1"
                secondary-label="CTA 2"
            >
                Primary Content
            </test-element>
            <test-element
                $on-ctaclick="{onCtaTwoClick}"
                title="Element 2"
                primary-label="CTA 3"
                secondary-label="CTA 4"
            >
                Secondary Content
            </test-element>
            <arpa-node name="content" is-content></arpa-node>
        `;
    }

    onCta1Click() {
        if (typeof this._config.onCta1Click === 'function') {
            this._config.onCta1Click();
        }
        console.log('👆 Element 1/3 CTA clicked');
    }

    onCtaTwoClick() {
        if (typeof this._config.onCta2Click === 'function') {
            this._config.onCta2Click();
        }
        console.log('👆 Element 2 CTA clicked');
    }
}

defineCustomElement('test-component', TestComponent);
