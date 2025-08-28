import { processTemplate } from './arpaElement.helper';

describe('ArpaElement Helper', () => {
    test('processTemplate', () => {
        const html = String.raw;
        const template = html`
            <div class="testDiv">{content}</div>
            <div class="testDiv2">{secondaryContent}</div>
        `;
        const content = processTemplate(template, {
            content: 'Some content',
            secondaryContent: 'some other content'
        });
        const container = document.createElement('div');
        container.innerHTML = content;

        const testDiv = container.querySelector('.testDiv');
        expect(testDiv.textContent).toBe('Some content');

        const testDiv2 = container.querySelector('.testDiv2');
        expect(testDiv2.textContent).toBe('some other content');
    });
});
