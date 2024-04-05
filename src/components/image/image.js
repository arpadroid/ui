/* eslint-disable indent */
import { editURL, attr, mergeObjects } from '@arpadroid/tools';
import ArpaElement from '../arpaElement/arpaElement.js';
import Icon from '../icon/icon.js';

/**
 * @typedef {import('./imageInterface.js').ImageInterface} ImageInterface
 */

const html = String.raw;
class ArpaImage extends ArpaElement {
    static sizes = {
        xxsmall: 80,
        xsmall: 160,
        small: 320,
        medium: 640,
        large: 1024,
        xlarge: 1280
    };

    constructor(config = {}) {
        super(config);
        this._onLoad = this._onLoad.bind(this);
        this._onError = this._onError.bind(this);
        this.src = this.getProperty('src');
    }

    /**
     * Gets the default configuration options for the component.
     * @returns {ImageInterface} - The default configuration options.
     */
    getDefaultConfig() {
        return mergeObjects(super.getDefaultConfig(), {
            sizes: ArpaImage.sizes,
            template: ArpaImage.template,
            alt: '',
            highResSrc: '',
            icon: 'crop_original',
            caption: '',
            hasPreloader: true,
            lazyLoad: false,
            onLoad: undefined,
            onError: undefined,
            onInput: undefined
        });
    }
    /**
     * Determines whether the component has a high-resolution preview image.
     * @returns {boolean} - True if the component has a high-resolution preview image; otherwise, false.
     */
    // hasPreview() {
    //     return this._config?.highResSrc;
    // }

    /**
     * Renders the component.
     */
    render() {
        const template = `${this.renderPreloader()} ${this.renderPicture()} ${this.renderThumbnail()}`;
        this.innerHTML = this.renderTemplate(template);
        if (this.isLoading()) {
            this.classList.remove('image--loaded');
        } else {
            this.classList.add('image--loaded');
        }
        // this._initializeDropArea();
        // this._initializeImagePreview(node);
    }

    _onConnected() {
        this.image = this.loadImage();
        // this.initializeImage();
    }

    renderPreloader() {
        const { hasPreloader } = this._config;
        const showPreloader = hasPreloader && this.isLoading() && !this.hasError();
        if (showPreloader) {
            return html`<circular-preloader variant="small"></circular-preloader>`;
        }
        return '';
    }

    renderThumbnail() {
        if (this.hasError()) {
            return html`
                <arpa-tooltip class="image__thumbnail" icon="{icon}" position="bottom">
                    Error loading image
                </arpa-tooltip>
            `;
        }
        return '';
    }

    renderPicture() {
        if (!this.hasError() && !this.isLoading()) {
            return html`
                <picture>
                    ${this.renderSources()}
                    <img src="{src}" alt="{alt}" />
                </picture>
            `;
        }
        return '';
    }

    getTemplateVars() {
        return {
            src: this.getProperty('src'),
            alt: this.getProperty('alt'),
            icon: this.getProperty('icon')
        };
    }

    renderSources() {
        return '';
    }

    isLoading() {
        // return true;
        return Boolean((this.src && !this.image?.naturalWidth) || this.isUploading);
    }

    hasError() {
        return Boolean(this._hasError);
    }

    /**
     * Loads the image.
     * @param {string} src - The source of the image to load.
     * @param {ImageInterface} config - The configuration options for the image.
     * @returns {HTMLImageElement | undefined} - The image element.
     */
    loadImage(src = this.src, config = this._config) {
        const { lazyLoad, alt, width, height } = config;
        if (src) {
            const image = new Image();
            image.addEventListener('load', this._onLoad);
            image.addEventListener('error', this._onError);
            attr(image, { alt, width, height });
            if (lazyLoad) {
                image.dataset.src = src;
                image.classList.add('lazyload');
            } else {
                image.src = src;
            }
            if (image.naturalWidth) {
                this._onLoad();
            }
            return image;
        }
    }

    /**
     * Initializes the image.
     */
    initializeImage() {
        const src = this.image?.dataset?.src;
        if (src) {
            this.image.src = src;
            delete this.image.dataset.src;
        }
    }

    /**
     * Initializes the image preview.
     * @param {HTMLElement} handler - The element to use as the image preview handler.
     */
    _initializeImagePreview(handler) {
        if (this.hasPreview()) {
            handler.type = 'button';
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

    /**
     * Waits for the image to finish loading.
     * @returns {Promise} - A promise that resolves when the image has finished loading.
     */
    onLoad() {
        return new Promise(resolve => {
            const onLoad = () => {
                this.image.removeEventListener('load', onLoad);
                this.image.removeEventListener('error', onLoad);
                resolve();
            };
            if (this.image?.naturalWidth) {
                resolve();
            } else {
                this.image.addEventListener('load', onLoad);
                this.image.addEventListener('error', onLoad);
            }
        });
    }

    /**
     * Called when the image has finished loading.
     * @param {Event} event
     */
    _onLoad(event) {
        const { onLoad } = this._config;
        // this.node?.appendChild(this.renderImage());
        // if (this.preloader) {
        //     new Animation(this.preloader).fadeOut().then(() => {});
        // }
        if (typeof onLoad === 'function') {
            onLoad(event, this);
        }
        this.stopPreloading();
    }

    /**
     * Called when the image has failed to load.
     * @param {Event} event
     */
    _onError(event) {
        this._hasError = true;
        const { onError } = this._config;
        if (typeof onError === 'function') {
            onError(event, this);
        }
        this.render();
    }

    /**
     * Renders the image error.
     * @returns {HTMLElement} - The rendered image error.
     */
    renderImageError() {
        console.log('renderImageError');
        const icon = new Icon('warning_amber', { tooltip: 'Error loading image' }).render();
        icon.classList.add('imageComponent__icon', 'imageComponent__icon--error');
        icon.title = 'Error loading image';
        return icon;
    }

    /**
     * Busts the cache for the image.
     */
    bustCache() {
        this.image.src = editURL(this.image.src, { bustCache: new Date().getTime() });
    }

    /**
     * Initializes the drop area for the component.
     */
    _initializeDropArea() {
        // const { onInput } = this._config;
        // if (!onInput) {
        //     return;
        // }
        // if (!this.dropArea) {
        //     this.dropArea = new DropArea(this.node, {
        //         content: 'Upload image',
        //         hasInput: this._config.hasInput ?? false,
        //         handler: this._config.dropAreaHandler ?? this.node,
        //         onDrop: this._onInput.bind(this),
        //         onError: this.hideDropArea.bind(this)
        //     });
        // }
        // this.dropAreaNode = this.dropArea.render();
        // this.node.addEventListener('dragover', event => {
        //     if (eventContainsFiles(event)) {
        //         this.dropAreaNode.style.opacity = 1;
        //     }
        // });
        // this.node.addEventListener('dragleave', () => {
        //     this.dropAreaNode.style.opacity = 0;
        // });
        // this.node.appendChild(this.dropAreaNode);
    }

    /**
     * Called when an image is dropped onto the component.
     * @param {FileList} files - The files that were dropped onto the component.
     * @param {DragEvent} event - The drag event.
     */
    _onInput(files, event) {
        const { onInput } = this._config;
        onInput(files, event, this);
        this.hideDropArea();
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
     * @param {number} timeout - The amount of time to wait before stopping preloading.
     */
    stopPreloading(timeout = 300) {
        setTimeout(() => {
            this.render();
            // this.classList.add('imageComponent--loaded');
        }, timeout);
    }

    /**
     * Shows the drop area for the component.
     */
    showDropArea() {
        this.dropAreaNode.style.display = '';
        requestAnimationFrame(() => (this.dropAreaNode.style.opacity = 1));
    }

    /**
     * Hides the drop area for the component.
     */
    hideDropArea() {
        requestAnimationFrame(() => (this.dropAreaNode.style.opacity = 0));
    }

    /**
     * Uploads an image.
     * @param {() => Promise} post - The function to call to upload the image.
     * @returns {Promise} - A promise that resolves when the image has been uploaded.
     */
    uploadImage(post) {
        return new Promise((resolve, reject) => {
            const postImage = async dialog => {
                dialog?.close();
                this.preload();
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
                this.uploadConfirmModal(postImage);
                return;
            }
            postImage();
        });
    }

    /**
     * Called when the image has been uploaded.
     * @param {Response} response - The response from the server.
     * @returns {Promise} - A promise that resolves when the component has been updated.
     */
    onImageUploaded(response) {
        this.render();
        return Promise.resolve(response);
    }

    /**
     * Called when an error occurs while uploading the image.
     * @param {Response} response - The response from the server.
     * @returns {Promise} - A promise that rejects with the response.
     */
    onImageUploadError(response) {
        // const message = response?.value?.message ?? 'Unable to upload image.';
        // Context.Messenger.error(message);
        return Promise.reject(response);
    }

    /**
     * Displays a confirmation modal before uploading the image.
     * @param {() => Promise} postImage - The function to call to upload the image.
     */
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
}

customElements.define('arpa-image', ArpaImage);

export default ArpaImage;
