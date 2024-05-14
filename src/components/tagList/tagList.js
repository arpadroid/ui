import { mergeObjects } from '@arpadroid/tools';
import List from '../../modules/list/components/list/list.js';
import Tag from '../tag/tag.js';

const html = String.raw;
class TagList extends List {
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            className: 'tagList',
            itemComponent: Tag,
            noItemsContent: html`<i18n-text key="components.tagList.txtNoTags"></i18n-text>`
        });
    }
}

customElements.define('tag-list', TagList);

export default TagList;
