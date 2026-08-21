import { defineCustomElement, mergeObjects } from '@arpadroid/tools';
import ArpaElement from '../arpaElement';

const html = String.raw;

export default class TestElement extends ArpaElement {
    getDefaultConfig() {
        const conf = {
            templateVars: {
                testContent: 'Top Content'
            },
            className: 'testComponent'
        };
        return mergeObjects(super.getDefaultConfig(), conf);
    }

    $renderBlueprint() {
        return html`
            <arpa-node name="legend" tag="legend">
                <h2>Test Element</h2>
                <p>
                    <i18n-text key="ui.arpaElement.docs.description.component"></i18n-text>
                </p>
            </arpa-node>

            <arpa-node name="header" tag="header">
                <p>{testVar}</p>
            </arpa-node>

            <arpa-node name="body" tag="main" is-content> </arpa-node>

            <arpa-node name="footer" tag="footer"></arpa-node>

            <arpa-node name="externalWrapper">
                <p>External wrapper</p>
            </arpa-node>
        `;
    }

    $renderTemplate() {
        return html`
            <fieldset>{legend}{header}{body}{footer}{testVar2}</fieldset>
            {externalWrapper}
        `;
    }
}

defineCustomElement('test-element', TestElement);
