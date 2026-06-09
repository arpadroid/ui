/**
 * @typedef {import('./tooltip.types.js').TooltipConfigType} TooltipConfigType
 * @typedef {import('../buttons/iconButton/iconButton.js').default} IconButton
 */
import { defineCustomElement, listen, normalizeTouchEvent, resolveNode, style } from '@arpadroid/tools';
import ArpaElement from '../core/arpaElement/arpaElement.js';

const html = String.raw;
class Tooltip extends ArpaElement {
    /** @type {TooltipConfigType} */
    _config = this._config;

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
     * @returns {HTMLElement | null | undefined}
     */
    getHandler() {
        return /** @type {HTMLElement | null} */ (
            this.handler || this.templateNodes?.handler || this.findHandler() || null
        );
    }

    hasCursorPosition() {
        return this.hasProp('has-cursor-position');
    }

    /**
     * Finds the tooltip handler element based on the configuration or DOM structure.
     * @returns {HTMLElement | null} The tooltip handler element, or null if not found.
     */
    findHandler() {
        if (this.handler instanceof HTMLElement) return this.handler;
        let handler = this.getProp('handler');
        handler && typeof handler === 'string' && (handler = resolveNode(handler));
        if (!(handler instanceof HTMLElement)) {
            handler = this.closest('.tooltip__handler, button, a');
            handler instanceof HTMLElement && this.classList.add('tooltip--contained');
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
    setHandler(handler) {
        if (!(handler instanceof HTMLElement)) return;
        this.handler = handler;
        this.handler.classList.add('tooltip__handler');
        this.hasCursorPosition() && this._handleCursorPosition();
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
                aria-hidden="true"
                tabindex="1"
            ></arpa-node>
        `;
    }

    async $initializeNodes() {
        await super.$initializeNodes();
        this.classList.add(`tooltip--${this.getPosition()}`);
        this.setHandler(this.getHandler());
        if (this.handler && !this.handler.isConnected) {
            this.appendChild(this.handler);
        }
        return true;
    }

    /**
     * Sets the tooltip content.
     * @param {string | HTMLElement | HTMLCollection | NodeList} content - The content to set.
     * @returns {Promise<void>}
     */
    async setContent(content = '') {
        !this._hasRendered && (await this.promise);
        const contentNode = this.contentNode || this.querySelector('.tooltip__content');
        if (!contentNode) return;
        contentNode.innerHTML = '';
        if (typeof content === 'string') {
            contentNode.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentNode.appendChild(content);
        } else if (content instanceof HTMLCollection || content instanceof NodeList) {
            contentNode.append(...content);
        }
    }

    /////////////////////////////////////
    // #region Cursor Positioning
    ////////////////////////////////////

    _handleCursorPosition(handler = this.getHandler()) {
        if (!this.contentNode) {
            this.contentNode = this.querySelector('.tooltip__content');
        }
        if (this.contentNode) {
            style(this.contentNode, { position: 'fixed', display: 'block' });
        }
        this._initializeCursorPosition();
        if (handler) {
            // @ts-ignore
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
     * @param {MouseEvent | TouchEvent} event
     */
    _onMouseTargetUpdate(target, event) {
        const { onMouseTargetUpdate } = this._config || {};
        if (typeof onMouseTargetUpdate === 'function') {
            onMouseTargetUpdate(/** @type {HTMLElement} */ (target), event);
        }
    }
    /**
     * Handles the mouse move event.
     * @param {MouseEvent | TouchEvent} event
     */
    _onMouseMove(event) {
        const { target, clientX, clientY } = normalizeTouchEvent(event);
        target !== this.mouseTarget && this._onMouseTargetUpdate(target, event);
        this.mouseTarget = /** @type {HTMLElement | null} */ (target);
        const offset = 16;
        const content = this.contentNode;
        const handler = this.handler;
        if (!content) return;

        const position = this.getProp('cursor-tooltip-position');
        const rect = handler?.getBoundingClientRect();
        if (!rect) return;

        const axis = this.getProp('cursor-position-axis') || 'x';
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
        const cursorTooltipPosition = this.getProp('cursor-tooltip-position');
        cursorTooltipPosition && this?.classList?.add(`tooltip--${cursorTooltipPosition}`);
    }

    // #endregion Cursor Positioning
}

defineCustomElement('arpa-tooltip', Tooltip);

export default Tooltip;
