import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import ArpaElement from '../arpaElement';

const html = String.raw;

export default class TestComponent extends ArpaElement {
    getDefaultConfig() {
        const conf = {
            className: 'testComponent',
            onHasClicked: null
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    $renderTemplate() {
        return html`
            <test-element
                $on-ctaclick="{onHasClicked}"
                title="Element 1"
                primary-label="CTA 1"
                secondary-label="CTA 2"
            >
                Primary Content
            </test-element>
            <test-element
                $on-ctaclick="{onHasClicked2}"
                title="Element 2"
                primary-label="CTA 3"
                secondary-label="CTA 4"
            >
                Secondary Content
            </test-element>
            <arpa-node name="content" is-content></arpa-node>
        `;
    }

    onHasClicked() {
        if (typeof this._config.onHasClicked === 'function') {
            this._config.onHasClicked();
        }
        // console.log('👆 Element 1/3 CTA clicked');
    }

    onHasClicked2() {
        if (typeof this._config.onHasClicked2 === 'function') {
            this._config.onHasClicked2();
        }
        // console.log('👆 Element 2 CTA clicked');
    }
}

defineCustomElement('test-component', TestComponent);
