/**
 * @typedef {import('../arpaElement.types').ArpaElementConfigType} ArpaElementConfigType
 */
import ArpaElement from '../arpaElement';
import {
    getArrayProp,
    getCallbackProp,
    getProp,
    evaluatePropToken,
    evaluateProp,
    hasProp
} from './arpaElementProps.helper';

/**
 * Creates and appends an ArpaElement to the document body.
 * @returns {Promise<ArpaElement>}
 */
async function createElement() {
    const el = /** @type {ArpaElement} */ (document.createElement('arpa-element'));
    document.body.appendChild(el);
    await customElements.whenDefined('arpa-element');
    return el;
}

describe('ArpaElementProps Helper', () => {
    /** @type {ArpaElement} */
    let el;
    beforeEach(async () => {
        el = await createElement();
    });
    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('hasProp', () => {
        test('returns false when attribute value is "false"', () => {
            el.setAttribute('my-prop', 'false');
            expect(hasProp(el, 'myProp')).toBe(false);
        });

        test('returns true when attribute exists with a value', () => {
            el.setAttribute('my-prop', 'hello');
            expect(hasProp(el, 'myProp')).toBe(true);
        });

        test('returns true when attribute exists with no value', () => {
            el.setAttribute('my-prop', '');
            expect(hasProp(el, 'myProp')).toBe(true);
        });

        test('returns config value when attribute absent', () => {
            // @ts-expect-error
            el.setConfig({ myProp: 'configured' });
            expect(hasProp(el, 'myProp')).toBe('configured');
        });

        test('returns undefined when neither attribute nor config has prop', () => {
            expect(hasProp(el, 'unknownProp')).toBeUndefined();
        });
    });

    // ─── getProp ────────────────────────────────────────────────────────────────

    describe('getProp', () => {
        test('returns attribute value (takes priority over config)', () => {
            // @ts-expect-error
            el.setConfig({ myProp: 'from-config' });
            el.setAttribute('my-prop', 'from-attr');
            expect(getProp(el, 'myProp')).toBe('from-attr');
        });

        test('returns config value when attribute absent', () => {
            // @ts-expect-error
            el.setConfig({ myProp: 'from-config' });
            expect(getProp(el, 'myProp')).toBe('from-config');
        });

        test('returns undefined when value is the string "undefined"', () => {
            el.setAttribute('my-prop', 'undefined');
            expect(getProp(el, 'myProp')).toBeUndefined();
        });

        test('returns undefined when prop absent from both attribute and config', () => {
            expect(getProp(el, 'unknownProp')).toBeFalsy();
        });
    });

    // ─── getArrayProp ───────────────────────────────────────────────────────────

    describe('getArrayProp', () => {
        test('splits comma-separated string and trims whitespace', () => {
            // @ts-expect-error
            el.setConfig({ testProp: ' value1,  value2, value3 ' });
            expect(getArrayProp(el, 'testProp')).toEqual(['value1', 'value2', 'value3']);
        });

        test('returns value as-is when it is already an array', () => {
            const arr = ['a', 'b'];
            // @ts-expect-error
            el.setConfig({ testProp: arr });
            expect(getArrayProp(el, 'testProp')).toBe(arr);
        });

        test('returns empty array when prop is absent', () => {
            expect(getArrayProp(el, 'unknownProp')).toEqual([]);
        });
    });

    // ─── getCallbackProp ────────────────────────────────────────────────────────

    describe('getCallbackProp', () => {
        test('returns undefined when prop does not start with ":"', () => {
            // @ts-expect-error
            el.setConfig({ onAction: 'plainValue' });
            expect(getCallbackProp(el, 'onAction')).toBeUndefined();
        });

        test('returns empty array when prop is absent', () => {
            expect(getArrayProp(el, 'unknownProp')).toEqual([]);
        });

        test('returns undefined when parent method does not exist', async () => {
            const parent = await createElement();
            const child = await createElement();
            parent.appendChild(child);
            // @ts-expect-error
            child.setConfig({ onAction: ':nonExistent' });
            expect(getCallbackProp(child, 'onAction')).toBeUndefined();
        });
    });

    // ─── evaluatePropToken ──────────────────────────────────────────────

    describe('evaluatePropToken', () => {
        test('returns true when element has the prop', () => {
            el.setAttribute('my-prop', 'yes');
            expect(evaluatePropToken(el, 'my-prop')).toBe(true);
        });

        test('returns false when element does not have the prop', () => {
            expect(evaluatePropToken(el, 'absent-prop')).toBe(false);
        });

        test('negation "!" returns false when prop exists', () => {
            el.setAttribute('my-prop', 'yes');
            expect(evaluatePropToken(el, '!my-prop')).toBe(false);
        });

        test('negation "!" returns true when prop is absent', () => {
            expect(evaluatePropToken(el, '!absent-prop')).toBe(true);
        });

        test('method call "()" returns true when method returns truthy', () => {
            // @ts-expect-error
            el.myMethod = () => true;
            expect(evaluatePropToken(el, 'myMethod()')).toBe(true);
        });

        test('method call "()" returns false when method returns falsy', () => {
            // @ts-expect-error
            el.myMethod = () => false;
            expect(evaluatePropToken(el, 'myMethod()')).toBe(false);
        });

        test('negated method call "!()" returns false when method returns truthy', () => {
            // @ts-expect-error
            el.myMethod = () => true;
            expect(evaluatePropToken(el, '!myMethod()')).toBe(false);
        });

        test('negated method call "!()" returns true when method returns falsy', () => {
            // @ts-expect-error
            el.myMethod = () => false;
            expect(evaluatePropToken(el, '!myMethod()')).toBe(true);
        });

        test('method call returns false when method does not exist', () => {
            expect(evaluatePropToken(el, 'nonExistentMethod()')).toBe(false);
        });
    });

    // ─── evaluateProp ───────────────────────────────────────────────────────

    describe('evaluateProp', () => {
        beforeEach(() => {
            el.setAttribute('var1', 'yes');
            // @ts-expect-error
            el.func2 = jest.fn(() => false);
            // @ts-expect-error
            el.getvalue3 = jest.fn(() => true);
        });

        test('single truthy token', () => {
            expect(evaluateProp(el, 'var1')).toBe(true);
        });

        test('single falsy token', () => {
            expect(evaluateProp(el, 'absent')).toBe(false);
        });

        test('OR: true || false → true', () => {
            expect(evaluateProp(el, 'var1 || absent')).toBe(true);
        });

        test('OR: false || false → false', () => {
            expect(evaluateProp(el, 'absent || absent2')).toBe(false);
        });

        test('AND: true && false → false', () => {
            expect(evaluateProp(el, 'var1 && absent')).toBe(false);
        });

        test('AND: true && true → true', () => {
            expect(evaluateProp(el, 'var1 && !absent')).toBe(true);
        });

        test('&& binds tighter than ||: false && false || true → true', () => {
            // absent && absent2 → false; var1 → true; false || true → true
            expect(evaluateProp(el, 'absent && absent2 || var1')).toBe(true);
        });

        test('complex: var1 || !var2 && !func2() || getvalue3()', () => {
            // var1 is set → first OR-group is true → overall true
            expect(evaluateProp(el, 'var1 || !absent && !func2() || getvalue3()')).toBe(true);
        });

        test('complex evaluates correctly when first token is false', () => {
            el.removeAttribute('var1');
            // absent=false; !absent=true && !func2()=true → second OR-group true
            expect(evaluateProp(el, 'var1 || !absent && !func2() || getvalue3()')).toBe(true);
        });

        test('all groups false → false', () => {
            // @ts-expect-error
            el.getvalue3 = () => false;
            expect(evaluateProp(el, 'absent || absent2 && absent3 || getvalue3()')).toBe(false);
        });
    });
});
