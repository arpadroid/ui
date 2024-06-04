import ArpaElement from '../../../../components/arpaElement/arpaElement.js';
import { render } from '@arpadroid/tools';
// import Sticky from '../../../../components/sticky/sticky.js';

const html = String.raw;
class ListControls extends ArpaElement {
    initializeProperties() {
        this.list = this.closest('.arpaList, arpa-list');
        super.initializeProperties();
    }

    getDefaultConfig() {
        return {
            className: 'listControls',
            hasStickyControls: this.list?.hasStickyControls(),
            template: html`{search}`
        };
    }

    getTemplateVars() {
        return {
            search: this.renderSearch()
            // sort: this.renderSort()
        };
    }

    renderSearch() {
        this.list = this.closest('.arpaList');
        return render(
            this.list?.hasSearch(),
            html`
                <list-search></list-search>
                <list-views></list-views>
            `
        );
    }

    postRender() {
        // super.postRender();
        // const { hasStickyControls } = this._config;
        // if (hasStickyControls) {
        //     if (!this.stickyControls) {
        //         this.stickyControls = new Sticky(this.node, {});
        //     } else {
        //         this.stickyControls.node = this.node;
        //     }
        // }
    }
}

customElements.define('list-controls', ListControls);

export default ListControls;
