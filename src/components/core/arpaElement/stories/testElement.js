import {
    defineCustomElement,
    dummyListener,
    dummySignal,
    mergeObjects,
    observerMixin
} from '@arpadroid/tools';
import ArpaElement from '../arpaElement';

const html = String.raw;

export default class TestElement extends ArpaElement {
    /**
     * @param {Record<string, unknown>} config
     */
    constructor(config) {
        super(config);
        this.on = dummyListener;
        this.signal = dummySignal;
        observerMixin(this);
    }

    getDefaultConfig() {
        const conf = {
            title: 'Test Element',
            primaryLabel: 'Primary CTA',
            secondaryLabel: 'Secondary CTA',
            templateVars: {
                testContent: 'Top Content'
            },
            className: 'testElement'
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    $renderBlueprint() {
        return html`
            <arpa-node name="legend" tag="legend">
                <h2>{title}</h2>
            </arpa-node>

            <arpa-node name="header" tag="header" can-render="header">
                <p>{testVar}</p>
            </arpa-node>

            <arpa-node name="body" tag="main" is-content></arpa-node>

            <arpa-node name="ctas" tag="div">
                <arpa-button tag="arpa-button" variant="primary-outlined" on-click="{onCtaClick}">
                    {primaryLabel}
                </arpa-button>

                <arpa-button variant="secondary-outlined" on-click="{onCtaClick}">
                    {secondaryLabel}
                </arpa-button>
            </arpa-node>

            <arpa-node name="footer" tag="footer"></arpa-node>

            <arpa-node name="externalWrapper">
                <p>External wrapper</p>
            </arpa-node>
        `;
    }

    /**
     * @param {Event} event
     */
    onCtaClick(event) {
        if (typeof this._config.onCtaClick === 'function') {
            this._config.onCtaClick(event);
        }
        console.log('👆 CTA clicked', event.target?.parentNode);
        this.signal('ctaclick', event);
    }

    $renderTemplate() {
        return html`
            <fieldset>{legend}{header}{body}{ctas}{footer}{testVar2}</fieldset>
            {externalWrapper}
        `;
    }
}

defineCustomElement('test-element', TestElement);
