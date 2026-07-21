/**
 * @typedef {import('./dropArea.types').DropAreaConfigType} DropAreaConfigType
 * @typedef {import('@arpadroid/tools').ObserverType} ObserverType
 */
import { eventContainsFiles, mergeObjects, observerMixin } from '@arpadroid/tools';
import { dummySignal, dummyListener, defineCustomElement, listen } from '@arpadroid/tools';
import ArpaElement from '../core/arpaElement/arpaElement.js';

const html = String.raw;
class DropArea extends ArpaElement {
    /**
     * Creates an instance of DropArea.
     * @param {DropAreaConfigType} config - The configuration object.
     */
    constructor(config = {}) {
        super(config);
        this.signal = dummySignal;
        this.on = dummyListener;
        observerMixin(this);
        this.bind('onHandlerLeave', 'preventDefaultBehavior', 'onHandlerEnter');
    }

    /**
     * Returns default configuration for DropArea.
     * @returns {DropAreaConfigType}
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.dropArea';
        return mergeObjects(super.getDefaultConfig(), {
            label: '{i18n:txtDropFiles}',
            className: 'dropArea',
            classNames: [() => this.hasProp('hasInput') && 'dropArea--hasInput'],
            icon: 'file_upload',
            handler: undefined,
            hasInput: true
        });
    }

    /**
     * Returns the input element.
     * @returns {HTMLElement | null}
     */
    getInput() {
        const inputId = this.getProp('input-id');
        if (typeof inputId === 'string') {
            const input = document.getElementById(inputId);
            if (input) return input;
        }
        const input = /** @type {unknown} */ (this.getProp('input'));
        if (input instanceof HTMLInputElement) return input;
        return this.querySelector('input[type="file"]');
    }

    $renderTemplate() {
        return html`<arpa-node
            name="handler"
            tag="button"
            on-click="{onHandlerClick}"
            on-drop="{onDrop}"
            class="fieldInput"
            type="button"
        >
            <div class="dropArea__content">
                <arpa-icon class="dropArea__icon">{icon}</arpa-icon>
                <p class="dropArea__label" zone="label">{label}</p>
            </div>
            <arpa-node
                name="input"
                tag="input"
                can-render="hasInput"
                accept="image/*"
                type="file"
            ></arpa-node>
        </arpa-node> `;
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        this.input = this.getInput();
        this._initializeHandler();
        return true;
    }

    _initializeHandler(node = this.nodes.handler) {
        if (!node) return;
        listen(node, ['dragenter', 'dragover', 'dragleave', 'drop'], this.preventDefaultBehavior, false);
        listen(node, ['dragenter', 'dragover'], this.onHandlerEnter, false);
        listen(node, ['dragleave', 'drop'], this.onHandlerLeave, false);
    }

    onHandlerEnter() {
        this.nodes.handler?.classList.add('dropArea__handler--active');
    }

    onHandlerLeave() {
        this.nodes.handler?.classList.remove('dropArea__handler--active');
    }

    onHandlerClick() {
        this.input?.click();
    }

    /**
     * Prevents the default behavior of an event.
     * @param {Event} event
     */
    preventDefaultBehavior(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handles the drop event.
     * @param {Event} event
     */
    onDrop(event) {
        if (!(event instanceof DragEvent)) return;
        event.preventDefault();
        event.stopPropagation();
        const dt = event.dataTransfer;
        if (dt) {
            const files = Array.from(dt.files);
            this.onFileAdded(files, event);
        }
    }

    /**
     * Handles the addition of files.
     * @param {File[]} files
     * @param {DragEvent} event
     */
    onFileAdded(files, event) {
        /** @type {string[]} */
        const errors = [];
        const { onDrop, onError } = this._config;
        if ((event.dataTransfer && !eventContainsFiles(event)) || !files.length) {
            return;
        }
        if (errors.length) {
            if (onError) {
                this.signal('error', errors, event);
                onError(errors, event);
            }
            return;
        }
        if (files?.length) {
            this.signal('drop', event, files);
            if (typeof onDrop === 'function') {
                onDrop(files, event);
            }
        }
    }
}

defineCustomElement('drop-area', DropArea);

export default DropArea;
