/**
 * @typedef {import('../dropArea/dropArea.js').default } DropArea
 * @typedef {import('../image/image.types').ImageConfigType} ImageConfigType
 * @typedef {import('../dialogs/dialog/dialog.js').default} Dialog
 * @typedef {import('../tooltip/tooltip.js').default} Tooltip
 * @typedef {import('../icon/icon.js').default} Icon
 */
import { attrString, classNames, attr, mergeObjects, defineCustomElement } from '@arpadroid/tools';
import { lazyLoad as lazyLoader, clearLazyImage, hasLoadedSource } from '@arpadroid/tools';
import { editURL, mapHTML, eventContainsFiles, addCssRule } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';

const html = String.raw;
class ArpaImage extends ArpaElement {
    ////////////////////////////
    // #region - INITIALIZATION
    ////////////////////////////
    _hasLoaded = false;
    _hasError = false;

    constructor(config = {}) {
        super(config);
        this.bind('_onLoad', '_onError', '_onInput', '_onDragEnter');
        /** @type {HTMLElement | undefined} */
        this.dropAreaNode = undefined;
        /** @type {string | null} */
        this.src = this.getProperty('src');
    }

    /**
     * Gets the default configuration options for the component.
     * @returns {ImageConfigType} - The default configuration options.
     */
    getDefaultConfig() {
        this.i18nKey = 'ui.image';
        return mergeObjects(super.getDefaultConfig(), {
            alt: '',
            caption: '',
            defaultSize: 'medium',
            dropAreaHandler: undefined,
            errorClass: 'image--error',
            loadingClass: 'image--loading',
            hasPreloader: true,
            hasPreview: false,
            hasDropArea: false,
            hasThumbnail: true,
            highResSrc: '',
            icon: 'crop_original',
            iconBroken: 'broken_image',
            lazyLoad: false,
            lazyLoaderBatchSize: 5,
            hasNativeLazy: false,
            loadedClass: 'image--loaded',
            onError: undefined,
            onInput: undefined,
            onLoad: undefined,
            preventUpscale: false,
            params: ['width', 'height', 'quality'],
            quality: 50,
            sizes: [],
            sizeMap: {
                xx_small: 50,
                x_small: 100,
                small: 200,
                medium: 320,
                big: 600,
                large: 900,
                x_large: 1200,
                xx_large: 2500,
                adaptive: '100%'
            },
            // i18n
            errLoad: this.i18n('errLoad'),
            lblLoadingImage: this.i18n('lblLoadingImage'),
            txtNoImage: this.i18n('txtNoImage'),
            txtUploadImage: this.i18n('txtUploadImage')
        });
    }

    // #endregion - INITIALIZATION

    ///////////////////////
    // #region - ACCESSORS
    ///////////////////////

    getLoadedClass() {
        return this.getProperty('loaded-class');
    }

    getLoadingClass() {
        return this.getProperty('loading-class');
    }

    getErrorClass() {
        return this.getProperty('error-class');
    }

    // #region - - Size

    /**
     * Gets the default size of the Image.
     * @returns {number}
     */
    getDefaultSize() {
        const sizes = this.getArrayProperty('sizes');
        const size = this.getProperty('default-size');
        const sizeMap = this._config.sizeMap;
        return sizeMap[size] ?? (Array.isArray(sizes) && sizes[0]);
    }

    /**
     * Gets the size of the Image.
     * @returns {number}
     */
    getSize() {
        return Number(this.getProperty('size') || this.getDefaultSize());
    }

    /**
     * Sets the size of the Image.
     * @param {number} width
     * @param {number} height
     */
    setSize(width, height = width) {
        if (width === this.getWidth() && height === (this.getHeight() || width)) {
            return;
        }
        this._hasLoaded = false;
        this.removeSizeClass();
        this.classList.remove(this.getLoadedClass());
        width && (this._config.width = width);
        height && (this._config.height = height);
        this.setAttribute('size', String(width));
        this._hasLoaded = false;
        this._hasError = false;
        this._hasRendered && this.reRender();
    }

    getWidth() {
        return this.getProperty('width') || this.getSize();
    }

    getHeight() {
        return this.getProperty('height');
    }

    // #endregion - Size

    /**
     * Loads a source image.
     * @param {string} src - The source of the image to load.
     */
    loadImage(src) {
        this.image && (this.image.src = src);
        this._hasLoaded = false;
        this._hasError = false;
        this.initializeImage();
    }

    getSource() {
        return this.getProperty('src');
    }

    getQuality() {
        return this.getProperty('quality');
    }

    /**
     * Gets the URL for the image with the specified width, height, and quality.
     * @param {number | string} width
     * @param {number | string} height
     * @param {number | string} quality
     * @returns {string} - The URL for the image.
     */
    getImageURL(width = this.getWidth(), height = this.getHeight(), quality = this.getQuality()) {
        let src = this.getSource();
        if (!height) {
            src = src?.replace(/&height=\[height\]/, '');
        }
        return (
            src
                ?.replace('[width]', String(width))
                ?.replace('[height]', String(height))
                ?.replace('[quality]', String(quality)) || ''
        );
    }

    isLoading() {
        return Boolean(this.src && !this.image?.naturalWidth && !this._hasLoaded);
    }

    // #region - - Has

    hasError() {
        return Boolean(this._hasError);
    }

    hasPreloader() {
        return this.getProperty('has-preloader') && this.isLoading() && !this.hasError();
    }

    hasLoaded() {
        return this._hasLoaded;
    }

    hasDropArea() {
        return this.hasProperty('has-drop-area');
    }

    hasThumbnail() {
        return (
            this.hasProperty('has-thumbnail') && (!this.hasLoaded() || !this.getSource() || this.hasError())
        );
    }

    hasLazyLoad() {
        return this.hasProperty('lazy-load') && !hasLoadedSource(this.getImageURL());
    }

    hasNativeLazy() {
        return this.hasProperty('has-native-lazy');
    }

    /**
     * Determines whether the component has a high-resolution preview image.
     * @returns {boolean} - True if the component has a high-resolution preview image; otherwise, false.
     */
    hasPreview() {
        return this._config?.highResSrc;
    }

    // #endregion - Has

    /**
     * Busts the cache for the image.
     */
    bustCache() {
        this.image && (this.image.src = editURL(this.image.src, { bustCache: new Date().getTime() }));
    }

    /**
     * Preloads the component.
     */
    preload() {
        this.src = null;
        this.isUploading = true;
        this.update();
    }

    /**
     * Stops preloading the component.
     * @param {string} addClass - The class to add to the component.
     */
    stopPreloading(addClass = this.getLoadedClass()) {
        !this.classList.contains(addClass) && this.classList.add(addClass);
        setTimeout(() => this.querySelector('circular-preloader')?.remove(), 1000);
    }

    /**
     * Shows the drop area for the component.
     */
    showDropArea() {
        this.dropAreaNode && (this.dropAreaNode.style.display = '');
        requestAnimationFrame(() => this.dropAreaNode && (this.dropAreaNode.style.opacity = '1'));
    }

    /**
     * Hides the drop area for the component.
     */
    hideDropArea() {
        requestAnimationFrame(() => this.dropArea && (this.dropArea.style.opacity = '0'));
    }

    // #endregion - ACCESSORS

    ////////////////////////////
    // #region - RENDERING
    ///////////////////////////

    /**
     * Renders the component.
     */

    render() {
        this.initializeStyles();
        if (this.isLoading()) {
            this.classList.add(this.getLoadingClass());
        }
        const caption = this.getProperty('caption');
        const template = html`
            ${caption ? '<figure>' : ''} {picture}
            ${caption ? html`<figcaption zone="caption">${caption}</figcaption>` : ''}
            ${caption ? '</figure>' : ''}
        `;
        this.innerHTML = this.renderTemplate(template) || '';
        // this._initializeImagePreview();
    }

    reRender() {
        this._hasLoaded = false;
        this._hasError = false;
        super.reRender();
    }

    getTemplateVars() {
        return {
            preloader: this.renderPreloader(),
            picture: this.renderPicture(),
            thumbnail: this.renderThumbnail(),
            dropArea: this.renderDropArea(),
            src: this.getProperty('src'),
            alt: this.getProperty('alt'),
            icon: this.getProperty('icon')
        };
    }

    renderPicture() {
        const src = this.getImageURL();
        const lazyLoad = this.hasLazyLoad();
        const hasNativeLazy = this.hasNativeLazy();
        const imageAttr = attrString({
            alt: this.getProperty('alt'),
            class: classNames({ 'image--lazy': Boolean(lazyLoad) }),
            'data-src': lazyLoad && !hasNativeLazy ? src : '',
            lazyLoad: lazyLoad && !hasNativeLazy,
            loading: (lazyLoad && hasNativeLazy && 'lazy') || undefined,
            src: lazyLoad && !hasNativeLazy ? '' : src
        });
        return html`
            <picture>
                ${this.renderThumbnail()} ${this.renderPreloader()} ${this.renderSources()}
                ${src ? html`<img ${imageAttr} />` : ''} ${this.renderDropArea()}
            </picture>
        `;
    }

    renderSources() {
        const sizes = this.getArrayProperty('sizes');
        if (!Array.isArray(sizes) || !sizes.length) return '';
        const quality = this.getProperty('quality');
        /**
         * Renders a source element for the image.
         * @param {number[]} sizes
         * @param {number} size
         * @returns {string}
         */
        const render = (sizes, size) => {
            const src = this.getImageURL(size, quality);
            return html`<source srcset="${src} ${size}px" />`;
        };
        return mapHTML(sizes, (/** @type {number} */ size) => render(sizes, size));
    }

    renderPreloader() {
        if (!this.hasPreloader()) return '';
        return html`<circular-preloader
            aria-label="${this.getText('lblLoadingImage')}"
            variant="small"
        ></circular-preloader>`;
    }

    renderThumbnail(text = this.hasError() ? this.getProperty('errLoad') : this.getProperty('txtNoImage')) {
        if (!this.hasThumbnail()) return '';
        return html`<arpa-tooltip class="image__thumbnail" icon="${this.getProperty('icon')}">
            <zone name="tooltip-content"> ${text} </zone>
        </arpa-tooltip>`;
    }

    // #endregion - Rendering

    //////////////////////////
    // #region - Drop Area
    //////////////////////////

    renderDropArea() {
        if (!this.hasDropArea()) return '';
        return html`<drop-area>
            <zone name="label">${this.getProperty('txtUploadImage')}</zone>
        </drop-area>`;
    }

    /**
     * Initializes the drop area for the component.
     */
    async initializeDropArea() {
        /** @type {DropArea | null} */
        this.dropArea = this.querySelector('drop-area');
        if (!this.dropArea) return;
        this.dropArea.addConfig({
            hasInput: this.getProperty('has-drop-area-input'),
            handler: this.getProperty('drop-area-handler') || this
        });
        await this.dropArea?.promise;
        this.dropArea?.on('drop', this._onInput);
        this.dropArea?.on('error', this.hideDropArea);
        this.addEventListener('dragenter', this._onDragEnter);
        this.addEventListener('dragleave', event => {
            if (event.relatedTarget instanceof HTMLElement && this.contains(event.relatedTarget)) {
                return;
            }
            this.dropArea && (this.dropArea.style.opacity = '0');
        });
    }

    /**
     * Called when an item is dragged over the component.
     * @param {DragEvent} event
     * @returns {void}
     */
    _onDragEnter(event) {
        if (event.relatedTarget instanceof HTMLElement && this.contains(event.relatedTarget)) {
            return;
        }
        if (eventContainsFiles(event)) {
            this.dropArea && (this.dropArea.style.opacity = '1');
        }
    }

    // #endregion - Drop Area

    ////////////////////
    // #region - Styles
    ////////////////////

    initializeStyles() {
        const size = this.getProperty('size');
        const height = this.getHeight() || this.getSize();
        const width = this.getWidth();
        this.removeSizeClasses();
        this.addSizeClass();
        if (size === 'adaptive') {
            this.classList.add('image--size-adaptive');
        } else if (width || height) {
            width === height && this.classList.add('image--square');
            const className = `image--size-${width}x${height}`;
            if (this.classList.contains(className)) return;
            this.classList.add(className);
            let css = '';
            if (width === 'auto' && height) {
                css += 'max-width: 100%;';
                css += 'width: auto;';
                css += `height: ${height}px;`;
            } else if (height === 'auto' && width) {
                css += 'max-height: 100%;';
                css += `width: ${width}px;`;
                css += 'height: auto;';
            } else {
                css = `max-width: 100%; 
                width: ${width}px;
                height: auto;`;
            }
            addCssRule(`.${className}.${className}`, css);
            addCssRule(`.${className} picture`, `aspect-ratio: ${width} / ${height};`);
        }
    }

    addSizeClass(width = this.getWidth()) {
        const size = this.getSizeKey(width);
        size && this.classList.add(`image--size-${size}`);
    }

    removeSizeClass() {
        this.classList.remove(`image--size-${this.getSizeKey()}`);
    }

    removeSizeClasses() {
        const classes = Array.from(this.classList).filter(
            className => !className.startsWith('image--size-') && className !== 'image--square'
        );
        this.setAttribute('class', classes.join(' '));
    }

    getSizeKey(width = this.getWidth()) {
        for (const [key, value] of Object.entries(this._config.sizeMap)) {
            if (value >= width) {
                return key;
            }
        }
    }

    // #endregion - Styles

    ///////////////////////
    // #region - Lifecycle
    ///////////////////////

    async _onConnected() {
        /** @type {HTMLImageElement | null} */
        this.image = this.querySelector('img');
        /** @type {Tooltip | null} */
        this.thumbnail = this.querySelector('.image__thumbnail');
        /** @type {HTMLPictureElement | null} */
        this.picture = this.querySelector('picture');
        this.hasDropArea() && this.initializeDropArea();
        this.initializeImage();
        const batchSize = this.getProperty('lazy-loader-batch-size');
        this.hasLazyLoad() &&
            !this.hasNativeLazy() &&
            this.image &&
            lazyLoader(this.image, Number(batchSize));
    }

    /**
     * Initializes the image preview.
     * @param {HTMLElement} handler - The element to use as the image preview handler.
     */
    _initializeImagePreview(handler) {
        if (this.hasPreview()) {
            handler.setAttribute('type', 'button');
            // handler.addEventListener('click', () => {
            //     const items = [
            //         {
            //             title: this._config?.caption,
            //             image: this._config.highResSrc
            //         }
            //     ];
            //     GalleryDialog.open(items);
            // });
        }
    }

    _onDestroy() {
        super._onDestroy();
        this._hasRendered = false;
        this._hasLoaded = false;
        this._hasError = false;
        const hasNativeLazy = this.hasNativeLazy();
        this.image?.removeEventListener('load', this._onLoad);
        this.image?.removeEventListener('error', this._onError);
        if (this.hasLazyLoad() && this.image instanceof HTMLImageElement) {
            this.image.dataset.src = '';
            !hasNativeLazy && clearLazyImage(this.image);
        }
        this.image && (this.image.src = '');
        this.image = null;
        this.thumbnail = null;
        this.picture = null;
    }

    // #endregion - LIFECYCLE

    ///////////////////////
    // #region - Events
    ///////////////////////

    /**
     * Loads the image.
     * @param {HTMLImageElement | null | undefined} image - The source of the image to load.
     * @param {ImageConfigType} config - The configuration options for the image.
     * @returns {HTMLImageElement | undefined} - The image element.
     */
    initializeImage(image = this.image, config = this._config || {}) {
        if (image instanceof HTMLImageElement) {
            image.removeEventListener('load', this._onLoad);
            image.removeEventListener('error', this._onError);
            image.addEventListener('load', this._onLoad);
            image.addEventListener('error', this._onError);
            attr(image, { alt: config.alt, width: config.width, height: config.height });
            if (image.naturalWidth) {
                this._onLoad();
            }
            return image;
        }
    }

    /**
     * Called when the image has finished loading.
     * @param {Event} [event]
     */
    _onLoad(event) {
        const { onLoad } = this._config;
        typeof onLoad === 'function' && onLoad(event, this);
        this._hasLoaded = true;
        this.stopPreloading();
        this.classList.remove(this.getLoadingClass());
        if (
            this.picture &&
            this.image &&
            this.hasProperty('prevent-upscale') &&
            this.image?.naturalWidth > 0
        ) {
            this.picture.style.maxWidth = this.image.naturalWidth + 'px';
            this.picture.style.maxHeight = this.image.naturalHeight + 'px';
        }
    }

    /**
     * Called when the image has failed to load.
     * @param {Event} event
     */
    _onError(event) {
        this._hasError = true;
        this._hasLoaded = true;
        const { onError } = this._config;
        typeof onError === 'function' && onError(event, this);
        this.stopPreloading(this.getErrorClass());
        this.classList.remove(this.getLoadingClass());
        this.thumbnail?.setContent(this.getProperty('errLoad'));
        /** @type {Icon | null | undefined} */
        const icon = this.thumbnail?.querySelector('arpa-icon');
        icon?.setIcon(this.getProperty('iconBroken'));
    }

    /**
     * Called when an image is dropped onto the component.
     * @param {FileList} files - The files that were dropped onto the component.
     * @param {DragEvent} event - The drag event.
     */
    _onInput(files, event) {
        const { onInput } = this._config;
        typeof onInput === 'function' && onInput(files, event, this);
        this.hideDropArea();
    }

    // #endregion - EVENTS

    //////////////////////////
    // #region - Uploads
    //////////////////////////

    /**
     * Called when the image has been uploaded.
     * @param {Response} response - The response from the server.
     * @returns {Promise<Response>} - A promise that resolves when the component has been updated.
     */
    onImageUploaded(response) {
        this.render();
        return Promise.resolve(response);
    }

    /**
     * Called when an error occurs while uploading the image.
     * @param {Response} response - The response from the server.
     * @returns {Promise<Response>} - A promise that rejects with the response.
     */
    onImageUploadError(response) {
        // const message = response?.value?.message ?? 'Unable to upload image.';
        // Context.Messenger.error(message);
        return Promise.reject(response);
    }

    /**
     * Displays a confirmation modal before uploading the image.
     */
    //  @param {() => Promise} postImage - The function to call to upload the image.
    uploadConfirmModal() {
        // params: postImage
        // const dialog = DialogService.openConfirmModal({
        //     content: 'If you continue the existing image will be replaced.',
        //     title: 'Upload image',
        //     variant: 'small',
        //     icon: 'upload',
        //     onConfirm: () => postImage(dialog)
        // });
    }

    /**
     * Uploads an image.
     * @param {() => Promise<Response>} post - The function to call to upload the image.
     * @returns {Promise<Response>} - A promise that resolves when the image has been uploaded.
     */
    uploadImage(post) {
        return new Promise((resolve, reject) => {
            /**
             * Posts the image to the server.
             * @param {Dialog} [dialog] - The dialog to close.
             * @returns {Promise<Response>} - A promise that resolves when the image has been uploaded.
             */
            const postImage = async dialog => {
                dialog?.close();
                return post()
                    .then(response => {
                        resolve(response);
                        return this.onImageUploaded(response);
                    })
                    .catch(response => {
                        dialog?.close();
                        reject(response);
                        return this.onImageUploadError(response);
                    });
            };
            if (this.src) {
                // this.uploadConfirmModal(postImage);
                return;
            }
            postImage();
        });
    }
}

defineCustomElement('arpa-image', ArpaImage);

export default ArpaImage;
