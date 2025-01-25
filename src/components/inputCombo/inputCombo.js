/**
 * @typedef {import('./inputCombo.types').InputComboConfigType} InputComboConfigType
 */

// @ts-ignore
import { isIOsSafari, mergeObjects, placeNode } from '@arpadroid/tools';

/** @type {EventTarget | null | undefined} */
let lastClicked = undefined;

/**
 * Represents an input combo component.
 */
class InputCombo {
    /**
     * Indicates whether the input combo is active or not.
     * @type {boolean}
     * @private
     */
    _isActive = false;

    /**
     * The CSS selector for focusing options within the combo.
     * @type {string}
     * @private
     */
    _optionFocusSelector = 'input, button, a';

    /**
     * The active instance of the InputCombo class.
     * @type {InputCombo | undefined}
     */
    static activeInstance;

    /**
     * An array of all instances of the InputCombo class.
     * @type {InputCombo[]}
     */
    static instances = [];

    /**
     * Indicates whether the InputCombo component has been initialized or not.
     * @type {boolean}
     * @static
     */
    static initialized = false;

    /**
     * The default configuration for the InputCombo component.
     * @type {InputComboConfigType}
     */
    _defaultConfig = {
        closeOnBlur: true,
        closeOnClick: true,
        hasToggle: true,
        isActive: false,
        containerSelector: 'li',
        position: {
            position: 'bottom-left'
        },
        onOpen: () => {},
        onClose: () => {}
    };

    /**
     * Initializes the InputCombo component.
     */
    static _initializeComponent() {
        InputCombo._onDocumentKeyDown.bind(InputCombo);
        if (!InputCombo.initialized) {
            document.addEventListener('click', InputCombo._onDocumentClick);
            document.addEventListener('keydown', InputCombo._onDocumentKeyDown);
            window.addEventListener('scroll', InputCombo._onScroll);
            window.addEventListener('resize', InputCombo._onScroll);
        }
        InputCombo.initialized = true;
    }

    /**
     * Handles the scroll event.
     */
    static _onScroll() {
        InputCombo.instances.forEach(instance => instance.isActive() && instance.place());
    }

    /**
     * Handles the document click event.
     * @param {Event} event
     * @static
     */
    static _onDocumentClick(event) {
        lastClicked = event.target;
        InputCombo.instances.forEach(instance => {
            const { closeOnClick, closeOnBlur } = instance._config;
            const { combo, input } = instance;
            if (closeOnBlur && instance.isActive()) {
                const target = event.target;
                if (!(target instanceof Node)) return;
                const isCombo = combo.contains(target) || combo === event.target;
                const isInput = input.contains(target) || input === event.target;
                const activeNode = event.target;
                if (!(activeNode instanceof HTMLElement)) return;
                const isContained = combo.contains(activeNode) || input.contains(activeNode);
                if (!isContained && ((!isCombo && !isInput) || (isCombo && closeOnClick))) {
                    requestAnimationFrame(() => instance.close());
                }
            }
        });
    }

    /**
     * Handles the document keydown event.
     * @param {KeyboardEvent} event - The keydown event.
     */
    static _onDocumentKeyDown(event) {
        if (InputCombo.activeInstance) {
            InputCombo.activeInstance._onComboKeyDown(event);
        }
    }

    /**
     * Returns the active instance of the InputCombo component.
     * @returns {InputCombo | undefined}
     */
    static getActiveInstance() {
        return InputCombo.instances.find(instance => instance.isActive());
    }

    /**
     * Creates a new instance of the InputCombo component.
     * @param {HTMLInputElement | HTMLButtonElement} input - The input element.
     * @param {HTMLElement & { InputCombo: InputCombo}} combo - The combo element.
     * @param {InputComboConfigType} config - The configuration for the InputCombo component.
     */
    constructor(input, combo, config) {
        combo.InputCombo = this;
        InputCombo.instances.push(this);
        InputCombo._initializeComponent();
        /** @type {HTMLInputElement | HTMLButtonElement} */
        this.input = input;
        /** @type {HTMLElement} */
        this.combo = combo;
        this.combo.classList.add('inputCombo');
        this.setConfig(config);
        this._initialize();
    }

    /**
     * Sets the configuration for the InputCombo component.
     * @param {InputComboConfigType} config - The configuration object.
     */
    setConfig(config) {
        /** @type {InputComboConfigType} */
        this._config = mergeObjects(this._defaultConfig, config);
    }

    /**
     * Initializes the InputCombo component.
     * @private
     */
    _initialize() {
        this._initializeProperties();
        this._initializeCombo();
        this.initializeInput();
    }

    /**
     * Initializes the properties and event listeners of the InputCombo component.
     * @private
     */
    _initializeProperties() {
        this._onFocus = this._onFocus.bind(this);
        this._onBlur = this._onBlur.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onInputKeyUp = this._onInputKeyUp.bind(this);
        this._onComboKeyUp = this._onComboKeyUp.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
    }

    /**
     * Initializes the combo element of the InputCombo component.
     * @private
     */
    _initializeCombo() {
        this.combo.style.display = 'none';
        this.combo.addEventListener('keyup', this._onComboKeyUp);
    }

    /**
     * Handles the keyup event on the combo element.
     * @param {KeyboardEvent} event - The keyup event.
     * @private
     */
    _onComboKeyUp(event) {
        if (event instanceof KeyboardEvent && event.keyCode === 27) {
            // ESC
            this.close();
        }
    }

    /**
     * Handles the keydown event on the combo element.
     * @param {KeyboardEvent} event - The keydown event.
     * @protected
     */
    _onComboKeyDown(event) {
        if (document.activeElement !== this.input) {
            return;
        }
        if (event.keyCode === 38) {
            event.preventDefault();
            // UP AROW
            this.focusPreviousOption();
        } else if (event.keyCode === 40) {
            event.preventDefault();
            // DOWN ARROW
            this.focusNextOption();
        }
    }

    /**
     * Checks if the input element is focused.
     * @returns {boolean} True if the input element is focused, false otherwise.
     */
    isFocused() {
        return this.input === document.activeElement;
    }

    /**
     * Initializes the input element of the InputCombo component.
     * @protected
     */
    initializeInput() {
        this.input.removeEventListener('keyup', this._onInputKeyUp);
        this.input.addEventListener('keyup', this._onInputKeyUp);
        this.input.removeEventListener('focus', this._onFocus);
        this.input.addEventListener('focus', this._onFocus);
        this.input.removeEventListener('blur', this._onBlur);
        this.input.addEventListener('blur', this._onBlur);
        this.input.removeEventListener('click', this._onClick);
        this.input.addEventListener('click', this._onClick);
        this.input.removeEventListener('mousedown', this._onMouseDown);
        this.input.addEventListener('mousedown', this._onMouseDown);
    }

    /**
     * Handles the click event on the input element.
     * @protected
     */
    _onClick() {
        const isSafari = isIOsSafari();
        if (this.isMouseFocus && (!isSafari || !(this.input instanceof HTMLButtonElement))) {
            return;
        }
        const isToggle = this._config.hasToggle && this._isActive;
        if (isToggle) {
            this.close();
            return;
        }
        this.open();
    }

    /**
     * Handles the mousedown event on the input element.
     * @protected
     */
    _onMouseDown() {
        if (!this.isFocused()) {
            this.isMouseFocus = true;
        } else {
            this.isMouseFocus = false;
        }
    }

    /**
     * Handles the keyup event on the input element.
     * @param {Event} event - The keyup event.
     */
    _onInputKeyUp(event) {
        if (event instanceof KeyboardEvent) {
            if (event.keyCode === 27) {
                this.close();
            } else if (event.keyCode === 40) {
                this.open();
                this.focusFirstOption();
            }
        }
    }

    /**
     * Handles the focus event on the input element.
     * @protected
     */
    _onFocus() {
        setTimeout(() => !this._isActive && this.open(), 100);
    }

    /**
     * Handles the blur event on the input element.
     * @param {Event} event
     */
    async _onBlur(event) {
        const { closeOnBlur } = this._config || {};
        await new Promise(resolve => setTimeout(resolve, 200));

        const isCombo = this.combo === document.activeElement;
        if (closeOnBlur && !isCombo && !this.isContained() && !this.isTargetContained(event)) {
            this.close();
        }
    }

    isContained() {
        const activeNode = document.activeElement;
        return this.combo.contains(activeNode) || this.input.contains(activeNode);
    }

    /**
     * Checks if the related target of the event is contained within the InputCombo component.
     * @param {Event & {relatedTarget?: HTMLElement | null}} event - The focus event.
     * @returns {boolean} True if the related target of the event is contained within the InputCombo component, false otherwise.
     */
    isTargetContained(event) {
        const isContained = lastClicked instanceof HTMLElement && this.combo.contains(lastClicked);
        return Boolean(
            (event?.relatedTarget && this.combo.contains(event?.relatedTarget)) ||
                isContained ||
                (event?.relatedTarget && this.input.contains(event?.relatedTarget))
        );
    }

    /**
     * Checks if the InputCombo component is active.
     * @returns {boolean} True if the InputCombo component is active, false otherwise.
     */
    isActive() {
        return this._isActive;
    }

    /**
     * Closes the InputCombo component.
     */
    close() {
        this.combo.classList.remove('inputCombo--active');
        this.input.classList.remove('inputCombo__input--active');
        if (!this._isActive && typeof this._config?.onClose === 'function') {
            this._config.onClose();
        }
        if (this.combo.parentNode === document.body) {
            this.combo.remove();
        }
        this._isActive = false;
        this.combo.style.display = 'none';
    }

    /**
     * Opens the InputCombo component.
     */
    open() {
        const { onOpen } = this._config || {};
        this.combo.style.display = 'block';
        requestAnimationFrame(() => {
            this._isActive = true;
            InputCombo.activeInstance = this;
            this.place();
            const selected = this.combo.querySelector('*[aria-selected="true"]');
            selected && selected?.scrollIntoView({ block: 'nearest' });
        });
        this.combo.classList.add('inputCombo--active');
        this.input.classList.add('inputCombo__input--active');
        if (typeof onOpen === 'function') {
            onOpen();
        }
    }

    /**
     * Places the InputCombo component in the correct position.
     */
    place() {
        const { position } = this._config || {};
        if (!position || !this._isActive) {
            return;
        }
        placeNode(this.combo, this.input, position);
    }

    /**
     * Focuses the first option within the combo.
     */
    focusFirstOption() {
        const option = this._getFirstAvailableOption();
        option instanceof HTMLElement && this.focusOption(option);
    }

    /**
     * Focuses a specific option within the combo.
     * @param {Element | null} node - The option element to focus.
     */
    focusOption(node) {
        const item = node?.querySelector(this._optionFocusSelector) ?? node;
        item instanceof HTMLElement && item?.focus();
    }

    /**
     * Focuses the next option within the combo.
     */
    focusNextOption() {
        const nextOption = this._getNextAvailableOption() ?? this._getFirstAvailableOption();
        nextOption instanceof HTMLElement && this.focusOption(nextOption);
    }

    /**
     * Focuses the previous option within the combo.
     */
    focusPreviousOption() {
        const option = this._getPreviousAvailableOption() ?? this._getLastAvailableOption();
        option instanceof HTMLElement && this.focusOption(option);
    }

    /**
     * Returns the currently focused element within the combo.
     * @returns {Element | null | undefined} The currently focused element.
     * @protected
     */
    _getFocused() {
        if (this.combo.contains(document.activeElement)) {
            return document.activeElement;
        }
    }

    /**
     * Returns the container element of the currently focused option.
     * @param {HTMLElement} node - The currently focused element.
     * @returns {HTMLElement} The container element of the currently focused option.
     * @protected
     */
    _getFocusedOptionContainer(node) {
        return node?.closest(this._config.containerSelector) ?? node;
    }

    /**
     * Returns the currently focused option.
     * @returns {Node | null | undefined} The currently focused option.
     */
    _getFocusedItem() {
        return this._getFocusedOptionContainer(this._getFocused());
    }

    /**
     * Returns the first available option within the combo.
     * @returns {Node | null | undefined}
     */
    _getFirstAvailableOption() {
        const firstOption = this.combo.querySelector(this._optionFocusSelector);
        /** @type {Node | null} */
        let firstNode = firstOption;
        while (firstNode instanceof HTMLElement && firstNode?.style?.display === 'none') {
            firstNode = firstNode.nextSibling;
        }
        return firstNode;
    }

    /**
     * Returns the next available option after the currently focused option.
     * @returns {Node | null | undefined}
     */
    _getNextAvailableOption() {
        let node = this._getFocusedItem()?.nextSibling;
        if (node instanceof HTMLElement) {
            while (node instanceof HTMLElement && node.style.display === 'none') {
                node = node.nextSibling;
            }
        }
        return node;
    }

    /**
     * Returns the previous available option before the currently focused option.
     * @param {boolean} loop - Indicates whether to loop to the last available option if the first option is reached.
     * @returns {Node | null | false }
     */
    _getPreviousAvailableOption(loop = true) {
        let node = this._getFocusedItem()?.previousSibling;
        while (node instanceof HTMLElement && node?.style?.display === 'none') {
            node = node.previousSibling;
        }
        return node || (loop && this._getLastAvailableOption());
    }

    getItems() {
        return Array.from(this.combo.querySelectorAll(this._config.containerSelector));
    }

    /**
     * Returns the last available option within the combo.
     * @returns {Node | null}
     */
    _getLastAvailableOption() {
        const items = this.getItems();
        let lastNode = items[items.length - 1];
        while (lastNode?.style?.display === 'none') {
            lastNode = lastNode.previousSibling;
        }
        return lastNode;
    }
}

export default InputCombo;
