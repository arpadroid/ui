/**
 * @typedef {import('../core/arpaElement/arpaElement.types.js').ArpaElementContentNodeType} ArpaElementContentNodeType
 * @typedef {import('./tooltip.types.js').TooltipConfigType} TooltipConfigType
 * @typedef {import('../buttons/iconButton/iconButton.js').default} IconButton
 */
import { defineCustomElement, listen, normalizeTouchEvent, resolveNode, style } from '@arpadroid/tools';
import ArpaElement from '../core/arpaElement/arpaElement.js';

const html = String.raw;
class Tooltip extends ArpaElement {
    /** @type {TooltipConfigType} */
    _config = this._config;

    /**
     * Creates a new Tooltip instance.
     * @param {TooltipConfigType} [config] - The configuration object for the tooltip.
     */
    constructor(config = {}) {
        super(config);
    }

    $preInitialize() {
        this.bind('_onMouseMove', '_onMouseEnter', '_onMouseLeave');
        this.handler = this.querySelector('.tooltip__handler, input, button, a');
        this.handler?.remove();
    }

    getPosition() {
        return this.getProp('position')?.trim() ?? 'top';
    }

    /**
     * Returns the tooltip handler element.
     * @returns {ArpaElementContentNodeType}
     */
    getHandler() {
        return this.handler || this.nodes?.handler || this.findHandler() || null;
    }

    /**
     * Finds the tooltip handler element based on the configuration or DOM structure.
     * @returns {HTMLElement | null} The tooltip handler element, or null if not found.
     */
    findHandler() {
        if (this.handler instanceof HTMLElement) return this.handler;
        let handler = this.getProp('handler');
        const containedHandler = this.closest('.tooltip__handler, button, a');
        if (containedHandler instanceof HTMLElement) {
            handler = containedHandler;
            this.classList.add('tooltip--contained');
        }
        if (!handler && typeof handler === 'string') {
            handler = resolveNode(handler);
        }
        return handler;
    }

    canRenderHandler() {
        return !this.findHandler();
    }

    /**
     * Sets the tooltip handler element.
     * @param {HTMLElement | unknown} handler - The handler element.
     */
    async setHandler(handler = this.getHandler()) {
        if (!(handler instanceof HTMLElement)) return;
        this.handler = handler;
        handler.classList.add('tooltip__handler');
        if (this.hasProp('hasCursorPosition')) {
            this._handleCursorPosition(handler);
        }
        if (!handler.isConnected && !handler.contains(this)) {
            this.appendChild(handler);
        }
    }

    /**
     * Returns the default configuration for the tooltip component.
     * @returns {TooltipConfigType} The default configuration object.
     */
    getDefaultConfig() {
        /** @type {TooltipConfigType} */
        const config = {
            icon: 'info',
            className: 'tooltip',
            cursorPositionAxis: 'x',
            cursorTooltipPosition: 'top',
            position: 'top'
        };
        return super.getDefaultConfig(config);
    }

    $renderTemplate() {
        return html`
            <arpa-node
                name="handler"
                tag="icon-button"
                can-render="canRenderHandler()"
                variant="minimal"
                icon="{icon}"
            ></arpa-node>
            <arpa-node
                name="content"
                is-content
                zone-name="tooltip-content"
                tag="span"
                role="tooltip"
                tabindex="1"
            ></arpa-node>
        `;
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        await new Promise(resolve => requestAnimationFrame(resolve));
        this.classList.add(`tooltip--${this.getPosition()}`);
        /** @todo Remove this setTimeout delay. */
        this.promise.then(() => this.setHandler());
        return true;
    }

    /////////////////////////////////////
    // #region Cursor Positioning
    ////////////////////////////////////

    _handleCursorPosition(handler = this.getHandler()) {
        const contentNode = this.getContentNode();
        if (contentNode instanceof HTMLElement) {
            style(contentNode, { position: 'fixed', display: 'block' });
        }
        this._initializeCursorPosition();
        if (handler) {
            listen(handler, ['mousemove', 'touchmove'], this._onMouseMove);
            listen(handler, ['mouseenter', 'touchmove'], this._onMouseEnter);
            listen(handler, ['mouseleave', 'touchend'], this._onMouseLeave);
        }
    }

    _onMouseLeave() {
        this.style.display = 'none';
    }

    _onMouseEnter() {
        this.style.display = '';
    }

    /** @type {HTMLElement | null} */
    mouseTarget = null;

    /**
     * Handles the mouse target update event.
     * @param {HTMLElement | null} target - The target element.
     * @param {Event} event
     */
    _onMouseTargetUpdate(target, event) {
        const { onMouseTargetUpdate } = this._config || {};
        if (typeof onMouseTargetUpdate === 'function') {
            onMouseTargetUpdate(/** @type {HTMLElement} */ (target), event);
        }
    }
    /**
     * Handles the mouse move event.
     * @param {Event} event
     */
    _onMouseMove(event) {
        const { target, clientX, clientY } = normalizeTouchEvent(
            /** @type {MouseEvent | TouchEvent} */ (event)
        );
        target !== this.mouseTarget && this._onMouseTargetUpdate(target, event);
        this.mouseTarget = /** @type {HTMLElement | null} */ (target);
        const offset = 16;
        const content = this.contentNode;
        const handler = this.handler;
        if (!(content instanceof HTMLElement)) return;

        const position = this.getProp('cursorTooltipPosition');
        const rect = handler?.getBoundingClientRect();
        if (!rect) return;

        const axis = this.getProp('cursorPositionAxis') || 'x';
        if (axis === 'x') {
            /** @type {string | number} */
            let top = rect.top - content.clientHeight - offset;
            let left = clientX;
            position === 'bottom' && (top = rect.top + rect.height - offset);
            const leftLimit = content.clientWidth / 2 + offset;
            clientX - leftLimit < 0 && (left = leftLimit);
            const rightLimit = window.innerWidth - content.clientWidth / 2 - offset;
            clientX > rightLimit && (left = rightLimit);
            style(content, {
                top: content.clientHeight <= 0 ? 'auto' : `${top}px`,
                right: 'auto',
                bottom: 'auto',
                left: `${left}px`
            });
        } else if (axis === 'y') {
            let left = rect.x - offset - content.clientWidth;
            position === 'right' && (left = rect.x + rect.width);
            style(content, { top: `${clientY}px`, right: 'auto', bottom: 'auto', left: `${left}px` });
        }
    }

    /**
     * Sets the cursor position.
     * @param {'x' | 'y'} axis - The axis to set the cursor position.
     * @param {'top' | 'bottom' | 'right' | 'left'} position - The position to set the cursor.
     */
    setCursorPosition(axis, position) {
        this.setAttribute('cursor-position-axis', axis);
        this.setAttribute('cursor-tooltip-position', position);
        this._initializeCursorPosition();
    }

    _initializeCursorPosition() {
        const positions = ['top', 'bottom', 'left', 'right'];
        positions.forEach(position => this?.classList?.remove(`tooltip--${position}`));
        const cursorTooltipPosition = this.getProp('cursorTooltipPosition');
        cursorTooltipPosition && this?.classList?.add(`tooltip--${cursorTooltipPosition}`);
    }

    // #endregion Cursor Positioning
}

defineCustomElement('arpa-tooltip', Tooltip);

export default Tooltip;
