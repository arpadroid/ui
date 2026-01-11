# @arpadroid/ui

A comprehensive web components framework built on modern standards, providing a rich set of reusable UI elements with advanced features like theming, internationalization, zone-based content projection, and a powerful and extensible component-based architecture.

[![npm version](https://badge.fury.io/js/@arpadroid%2Fui.svg)](https://www.npmjs.com/package/@arpadroid/ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

For other more specialized or advanced UI packages based on this library, please check out:

-   [@arpadroid/navigation](https://www.npmjs.com/package/@arpadroid/navigation) - Navigation components and routing solutions
-   [@arpadroid/messages](https://www.npmjs.com/package/@arpadroid/messages) - Messaging and notification components
-   [@arpadroid/forms](https://www.npmjs.com/package/@arpadroid/forms) - Advanced form components and validation
-   [@arpadroid/lists](https://www.npmjs.com/package/@arpadroid/lists) - List and data grid components
-   [@arpadroid/gallery](https://www.npmjs.com/package/@arpadroid/gallery) - Image gallery and carousel components

## Table of Contents

-   [Features](#features)
-   [Installation](#installation)
-   [Quick Start](#quick-start)
-   [Components Overview](#components-overview)
    -   [Core Components](#core-components)
    -   [Button Components](#button-components)
    -   [Layout & Navigation](#layout--navigation)
    -   [Media & Content](#media--content)
    -   [Interactive Components](#interactive-components)
    -   [Dialog System](#dialog-system)
    -   [Input Components](#input-components)
    -   [Feedback Components](#feedback-components)
-   [Zone System](#zone-system)
    -   [Basic Zone Usage](#basic-zone-usage)
    -   [Programmatic Zone Management](#programmatic-zone-management)
    -   [Zone Configuration](#zone-configuration)
-   [Theme System](#theme-system)
    -   [Built-in Themes](#built-in-themes)
    -   [Theme Usage](#theme-usage)
    -   [Custom Themes](#custom-themes)
-   [Internationalization](#internationalization)
    -   [Automatic Text Resolution](#automatic-text-resolution)
    -   [Dynamic Content](#dynamic-content)
-   [API Reference](#api-reference)
    -   [ArpaElement Base Class](#arpaelement-base-class)
    -   [Component-Specific APIs](#component-specific-apis)
-   [Advanced Usage](#advanced-usage)
    -   [Custom Component Development](#custom-component-development)
    -   [Event Handling](#event-handling)
    -   [Advanced Templating](#advanced-templating)
-   [Browser Support](#browser-support)
-   [Development](#development)
-   [Performance](#performance)
-   [Best Practices](#best-practices)
-   [TypeScript Support](#typescript-support)
-   [Contributing](#contributing)
-   [License](#license)
-   [Related Packages](#related-packages)

## Features

🎨 **Modern Web Components** - Standards-based custom elements with full browser support  
🎯 **Zone-Based Architecture** - Flexible templating system with declarative content placement  
🌍 **Internationalization Ready** - Built-in i18n support with dynamic text replacement  
🎭 **Theme System** - Multiple themes (default, dark, mobile) with CSS custom properties  
🔧 **TypeScript Support** - Comprehensive type definitions for all components  
📱 **Responsive Design** - Mobile-first approach with adaptive layouts  
♿ **Accessibility** - ARIA attributes and semantic markup built-in  
⚡ **Performance Optimized** - Lazy loading and efficient rendering patterns  
🛠️ **Developer Experience** - Rich API with extensive configuration options

## Installation

```bash
npm install @arpadroid/ui
```

## Quick Start

```html
<!DOCTYPE html>
<html>
    <head>
        <script type="module" src="node_modules/@arpadroid/ui/dist/arpadroid-ui.js"></script>
        <link rel="stylesheet" href="node_modules/@arpadroid/ui/dist/themes/default/default.min.css" />
        <link rel="stylesheet" href="node_modules/material-symbols/outlined.css" />
    </head>
    <body>
        <!-- Basic button with icon -->
        <arpa-button icon="settings" variant="primary">
            <span>Settings</span>
            <!-- Tooltip component -->
            <arpa-tooltip text="Click to save your changes"> </arpa-tooltip>
        </arpa-button>

        <!-- Dialog component -->
        <arpa-dialog id="confirm-dialog" title="Confirm Action">
            <p>Are you sure you want to proceed?</p>
        </arpa-dialog>

        <!-- Button with Dialog -->
        <arpa-button id="open-dialog-button" variant="secondary">
            Open Dialog
            <arpa-dialog id="custom-dialog" title="Custom Dialog" variant="large">
                <zone name="content">
                    <p>Dialog content goes here</p>
                </zone>
                <zone name="actions">
                    <arpa-button variant="secondary">Cancel</arpa-button>
                    <arpa-button variant="primary">Confirm</arpa-button>
                </zone>
            </arpa-dialog>
        </arpa-button>
    </body>
</html>
```

## Components Overview

### Core Components

#### ArpaElement

The foundational base class for all UI components, providing:

-   Zone-based templating system
-   Internationalization integration
-   Easy observer pattern implementation
-   Lifecycle management
-   Property binding and validation

```javascript
import { ArpaElement } from '@arpadroid/ui';
import { defineCustomElement, observerMixin } from '@arpadroid/tools';

const html = String.raw;
class CustomComponent extends ArpaElement {
    getDefaultConfig() {
        return super.getDefaultConfig({
            className: 'customComponent',
            buttonText: 'Default Button Text',
            templateChildren: {
                content: { tag: 'span' },
                actions: { tag: 'span' }
            }
        });
    }

    getTemplateVars() {
        return {
            myVar: 'Some dynamic content',
            buttonText: this.getProperty('buttonText')
        };
    }

    _initialize() {
        // Pre-bind event listeners
        this.bind('dataLoaded');
        // Apply observer mixin for reactive properties
        observerMixin(this);
        // Perform some asynchronous operation
        fetch('data/api/endpoint').then(payload => {
            this.payload = payload;
            // Signal that data has been loaded. The methods signal, on, and off are automatically bound to this class by the observerMixin function.
            this.signal('dataLoaded', { payload });
        });

        this.on('dataLoaded', this.onDataLoaded);
        /**
         * The code above can and would be normally used externally to listen to events.
         * Because the observer mixin uses a Set to maintain callbacks, there is no danger of
         * duplicate bindings, however one must make sure to pre-bind the methods appropriately.
         * ArpaElement provides a utility to conveniently pre-bind methods within the class as seen above: this.bind('method1', ...);
         * It's best practice to avoid passing anonymous functions directly to the 'on' method above in order to prevent unwanted bindings.
         */
    }

    onDataLoaded({ payload }) {
        console.log('Data loaded:', payload);
    }

    _renderTemplate() {
        return html`
            {content}
            <span>Static content</span>
            {actions}
            <arpa-button className="customComponent__button" zone="custom-button">
                {buttonText}
            </arpa-button>
        `;
    }

    async _initializeNodes() {
        // Custom initialization logic here
        this.button = this.querySelector('.customComponent__button');
        return super._initializeNodes();
    }
}

defineCustomElement('custom-component', CustomComponent);
```

```html
<custom-component>
    <zone name="main"> Main content goes here </zone>
    <zone name="actions"> Action buttons here </zone>
    <zone name="secondary"> Overridden Secondary content </zone>
    main content
</custom-component>
```

```javascript
const customComponent = document.querySelector('custom-component');
customComponent.on('dataLoaded', ({ payload }) => {
    console.log('Data loaded:', payload);
});
```

### Button Components

#### Button

Versatile button component with icons, variants, and states.

```html
<!-- Basic buttons -->
<arpa-button>Default Button</arpa-button>
<arpa-button variant="primary">Primary Button</arpa-button>
<arpa-button variant="secondary">Secondary Button</arpa-button>

<!-- With icons -->
<arpa-button icon="add" variant="primary">Add Item</arpa-button>
<arpa-button icon="edit" rhs-icon="arrow_forward">Edit</arpa-button>

<!-- States -->
<arpa-button disabled>Disabled</arpa-button>
<arpa-button loading>Loading...</arpa-button>
```

#### IconButton

Compact button for icon-only actions.

```html
<icon-button icon="close" tooltip="Close"></icon-button>
<icon-button icon="favorite" variant="filled"></icon-button>
```

#### DarkModeButton

Toggle button for switching between light and dark themes.

```html
<dark-mode-button></dark-mode-button>
```

### Layout & Navigation

#### Pager

Pagination component with customizable layouts, arrow controls, and URL integration.

```html
<!-- Basic pagination -->
<arpa-pager total-pages="25" current-page="5" max-nodes="7"> </arpa-pager>

<!-- Advanced pagination with all options -->
<arpa-pager
    id="product-pager"
    total-pages="100"
    current-page="1"
    max-nodes="9"
    url-param="page"
    item-component="pager-item"
    has-arrow-controls="true"
    adjust-selected-position="true"
    aria-label="Product pagination"
>
</arpa-pager>

<!-- Minimal pagination without arrow controls -->
<arpa-pager total-pages="10" current-page="3" max-nodes="5" has-arrow-controls="false"> </arpa-pager>
```

**JavaScript API:**

```javascript
const pager = document.querySelector('arpa-pager');

// Set current page and total pages
pager.setPager(5, 50);

// Set individual properties
pager.setCurrentPage(3);
pager.setTotalPages(100);

// Get current state
const currentPage = pager.getCurrentPage();
const totalPages = pager.getTotalPages();
const nextPage = pager.getNextPage();
const prevPage = pager.getPrevPage();

// Listen for page changes
pager.on('change', ({ page, node, event }) => {
    console.log(`Navigated to page ${page}`);
    console.log('Clicked pager item:', node);

    // You can prevent default behavior or add custom logic here
    event.preventDefault();
    // Custom navigation logic
});
```

**Key Features:**

-   **URL Integration**: Automatically updates URL parameters for bookmarkable pages
-   **Arrow Controls**: Previous/next navigation buttons
-   **Responsive**: Adjusts visible page numbers based on `max-nodes`
-   **Accessibility**: Full ARIA support and keyboard navigation
-   **Custom Components**: Use custom pager item components

### Media & Content

#### Icon

Material Symbols icon component with automatic styling.

```html
<arpa-icon>settings</arpa-icon>
<arpa-icon>favorite</arpa-icon>
<arpa-icon>arrow_forward</arpa-icon>
```

#### Image

Enhanced image component with lazy loading, responsive sizing, drag-and-drop upload, preview functionality, and error handling.

```html
<!-- Basic usage -->
<arpa-image src="/path/to/image.jpg" alt="Product image"> </arpa-image>

<!-- Advanced usage with all features -->
<arpa-image
    src="/path/to/image.jpg"
    high-res-src="/path/to/high-res-image.jpg"
    alt="Product showcase image"
    caption="Beautiful product display"
    size="large"
    width="800"
    height="600"
    quality="80"
    has-preloader="true"
    has-preview="true"
    has-drop-area="true"
    has-thumbnail="true"
    is-draggable="true"
    lazy-load="true"
    prevent-upscale="true"
    preview-title="Product Gallery"
    icon="crop_original"
    default-size="medium"
    loaded-class="custom-loaded"
    loading-class="custom-loading"
    error-class="custom-error"
>
</arpa-image>

<!-- Responsive image with different sizes -->
<arpa-image
    src="/path/to/image.jpg"
    alt="Responsive image"
    size="adaptive"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
>
</arpa-image>

<!-- Upload-enabled image with drop area -->
<arpa-image
    has-drop-area="true"
    alt="Upload area"
    icon="cloud_upload"
    caption="Drop files here or click to upload"
>
</arpa-image>
```

**Key Features:**

-   **Lazy Loading**: Efficient loading with intersection observer
-   **Responsive Sizing**: Predefined sizes (xx_small, x_small, small, medium, big, large, x_large, xx_large, adaptive)
-   **High-Resolution Support**: Separate high-res source for preview/zoom
-   **Drag & Drop Upload**: Built-in file upload functionality
-   **Preview Modal**: Lightbox-style image preview
-   **Error Handling**: Graceful fallbacks and error states
-   **Custom Quality**: JPEG quality control for optimization
-   **Thumbnail Generation**: Automatic thumbnail creation

#### TruncateText

Text truncation with expand/collapse functionality and smart content detection.

```html
<!-- Basic text truncation -->
<truncate-text max-length="100">
    This is a long piece of text that will be automatically truncated when it exceeds the maximum length
    specified. The component will add ellipsis and show only the first 100 characters.
</truncate-text>

<!-- With read more/less toggle -->
<truncate-text
    max-length="150"
    threshold="20"
    has-read-more-button="true"
    read-more-label="Show more"
    read-less-label="Show less"
    ellipsis="..."
>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
    ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
    fugiat nulla pariatur.
</truncate-text>

<!-- Rich HTML content truncation -->
<truncate-text max-length="200" has-read-more-button="true">
    <p>This component can handle <strong>rich HTML content</strong> including:</p>
    <ul>
        <li>Bold and <em>italic</em> text</li>
        <li>Links and <a href="#">anchor tags</a></li>
        <li>Lists and other block elements</li>
    </ul>
    <p>The truncation preserves the HTML structure while limiting text length.</p>
</truncate-text>

<!-- Custom styling -->
<truncate-text
    max-length="80"
    has-read-more-button="true"
    button-classes="btn btn-link text-primary"
    content-class="text-muted"
>
    Custom styled truncated text with different button and content classes applied for better integration with
    your design system.
</truncate-text>
```

**JavaScript API:**

```javascript
const truncateText = document.querySelector('truncate-text');

// Programmatically toggle truncation
truncateText.toggleTruncate();

// Show full content
truncateText.showFullContent();

// Truncate content
truncateText.truncateText();

// Check if content should be truncated
const shouldTruncate = truncateText.shouldTruncate();
```

**Key Features:**

-   **Smart Truncation**: Only truncates when content exceeds `max-length + threshold`
-   **HTML Preservation**: Maintains HTML structure during truncation
-   **Dynamic Content**: Observes content changes and re-evaluates truncation
-   **Customizable Labels**: Configure "read more" and "read less" button text
-   **Flexible Styling**: Custom CSS classes for buttons and content
-   **Accessibility**: Proper ARIA labels and keyboard navigation

### Interactive Components

#### Tooltip

Contextual information display with multiple positioning options. Tooltips automatically attach to their closest button/link parent or can be configured with specific handlers.

```html
<!-- Tooltip automatically attaches to button parent -->
<arpa-button tooltip="Save your changes"> Save </arpa-button>

<!-- Standalone tooltip with text attribute -->
<arpa-tooltip text="Helpful information" icon="info"></arpa-tooltip>

<!-- Tooltip with specific handler element -->
<div>
    <span id="target">Hover over me</span>
    <arpa-tooltip text="Custom tooltip" handler="#target" position="top"></arpa-tooltip>
</div>

<!-- Tooltip with cursor position tracking -->
<arpa-button>
    Hover me
    <arpa-tooltip text="This tooltip follows the cursor" position="cursor" has-cursor-position="true">
    </arpa-tooltip>
</arpa-button>

<!-- Tooltip with custom content -->
<arpa-button>
    Complex tooltip
    <arpa-tooltip position="bottom">
        <strong>Rich Content</strong>
        <p>This tooltip can contain HTML elements.</p>
    </arpa-tooltip>
</arpa-button>

<!-- Icon button with tooltip -->
<icon-button icon="delete" tooltip="Delete item" tooltip-position="right"></icon-button>
```

**Position Options:**

-   `top` (default)
-   `bottom`
-   `left`
-   `right`
-   `cursor` - Follows mouse cursor

**Usage Patterns:**

1. **Button Integration**: Use `tooltip` attribute on buttons for simple text tooltips
2. **Standalone**: Use `<arpa-tooltip>` with `text` attribute and optional `icon`
3. **Custom Handler**: Specify target element with `handler` attribute
4. **Rich Content**: Place HTML content inside tooltip tags

#### DropArea

The `drop-area` component creates a file drop zone with drag and drop functionality.

```html
<drop-area has-input="true" label="Drop files here" icon="upload">
    Drop files here or click to select
</drop-area>
```

**HTML Attributes:**

-   `has-input` - Show file input button (boolean)
-   `input-id` - ID of external file input element
-   `label` - Label text
-   `icon` - Icon name

**JavaScript API:**

```javascript
const dropArea = document.querySelector('drop-area');

// Subscribe to drop events
dropArea.on('drop', (event, files) => {
    console.log('Files dropped:', files);
    // Handle the dropped files
});

// Subscribe to error events
dropArea.on('error', (errors, event) => {
    console.log('Errors:', errors);
});

// Get the file input element
const fileInput = dropArea.getFileInput();

// Check if has input button
const hasInput = dropArea.hasInput();
```

**Events:**

-   `drop` - Fired when files are dropped (detail: { files, event })
-   `error` - Fired when validation errors occur

### Dialog System

#### Dialog

Modal dialogs with flexible content and actions.

```html
<arpa-dialog id="customDialog" title="Custom Dialog" variant="large">
    <zone name="content">
        <p>Dialog content goes here</p>
    </zone>
    <zone name="actions">
        <arpa-button variant="secondary">Cancel</arpa-button>
        <arpa-button variant="primary">Confirm</arpa-button>
    </zone>
</arpa-dialog>
```

#### ConfirmDialog

Pre-configured confirmation dialogs.

```html
<!-- Basic confirmation dialog -->
<confirm-dialog id="my-confirm" title="Confirm Action"> Are you sure you want to proceed? </confirm-dialog>

<!-- With custom icon -->
<confirm-dialog title="Delete Item" icon="delete"> This action cannot be undone. </confirm-dialog>
```

```javascript
// Listen for user response
document.getElementById('my-confirm').on('confirm', () => {
    console.log('User confirmed');
});
```

#### DeleteDialog

Specialized dialog for delete confirmations.

```html
<delete-dialog item-name="User Profile" confirm-text="DELETE"> </delete-dialog>
```

### Input Components

#### InputCombo

Enhances existing HTML elements with dropdown functionality (JavaScript class, not a web component).

```html
<!-- HTML structure -->
<input type="text" id="search-input" placeholder="Search..." />
<ul id="search-combo" class="dropdown-menu">
    <li><button>Option 1</button></li>
    <li><button>Option 2</button></li>
    <li><button>Option 3</button></li>
</ul>
```

```javascript
import { InputCombo } from '@arpadroid/ui';

// Initialize with input element, combo element, and config
const inputElement = document.getElementById('search-input');
const comboElement = document.getElementById('search-combo');

const combo = new InputCombo(inputElement, comboElement, {
    closeOnBlur: true,
    closeOnClick: true,
    hasToggle: true,
    position: { position: 'bottom-left' },
    onOpen: () => console.log('Dropdown opened'),
    onClose: () => console.log('Dropdown closed')
});

// Control the dropdown
combo.open();
combo.close();
combo.toggle();
```

### Feedback Components

#### CircularPreloader

Loading indicators with customizable appearance.

```html
<!-- Basic preloader -->
<circular-preloader></circular-preloader>

<!-- With text and mask -->
<circular-preloader text="Loading data..." has-mask="true" variant="large"> </circular-preloader>
```

## Zone System

The zone system is a powerful templating feature that allows flexible content placement:

### Basic Zone Usage

```html
<arpa-element>
    <zone name="header">Header content</zone>
    <zone name="content">Main content</zone>
    <zone name="footer">Footer content</zone>
</arpa-element>
```

### Programmatic Zone Management

```javascript
import { zoneTool } from '@arpadroid/ui';

// Place content in zones
zoneTool.placeZone(element, 'header', '<h1>Title</h1>');

// Check if zone exists
if (zoneTool.hasZone(element, 'actions')) {
    // Add action buttons
}

// Extract zones from template
const zones = zoneTool.extractZones(templateString);
```

### Zone Configuration

```javascript
class CustomElement extends ArpaElement {
    getDefaultConfig() {
        return {
            templateChildren: {
                header: {
                    tag: 'header',
                    zoneName: 'header',
                    className: 'element__header',
                    content: '{title}{subtitle}'
                },
                content: {
                    tag: 'main',
                    zoneName: 'content'
                },
                actions: {
                    tag: 'div',
                    zoneName: 'actions',
                    className: 'element__actions'
                }
            }
        };
    }

    _getTemplate() {
        return html`
            <div class="custom-element">
                {header}
                <!-- The {header} token and others as such will be replaced with the corresponding elements defined in templateChildren configuration.  
                Note that getTemplateVars also defines template variables for dynamic content rendering.
                -->
                <div class="custom-element__body">
                    {content}
                    <zone name="extra-content">
                        <!-- Additional content can be placed here -->
                    </zone>
                </div>
                {actions}
            </div>
        `;
    }

    getTemplateVars() {
        return {
            title: this.renderTitle(),
            subtitle: this.renderSubtitle()
        };
    }
}
```

## Theme System

The Arpadroid UI framework features a sophisticated theming system that provides flexibility, scalability, and loose coupling between components and themes. The system is built around CSS file naming conventions and theme configuration files that enable automatic compilation and bundling.

### Architecture Overview

The theming system consists of two distinct layers:

1. **Theme Files** - Located in `src/themes/[themeName]/` directories
2. **Component Styles** - Located alongside each component with theme-specific naming conventions

This separation ensures that component styles remain loosely coupled to themes, providing maximum flexibility with zero setup overhead.

### CSS File Naming Conventions

Component styles follow a specific naming pattern based on sub-extensions that determine compilation behavior:

```
componentName.{theme}.css
```

**Supported Theme Extensions:**

-   `.default.css` - Default theme styles (included in all theme bundles)
-   `.dark.css` - Dark theme specific styles
-   `.mobile.css` - Mobile theme specific styles
-   `.{customTheme}.css` - Custom theme specific styles

**Examples:**

```
button.default.css     → Included in default, dark, and mobile themes
button.dark.css        → Only included in dark theme bundle
dropArea.default.css   → Included in all themes
dropArea.dark.css      → Only included in dark theme bundle
```

#### Theming in practice

-   Name files as `componentName.{theme}.css` (e.g., `.default.css`, `.dark.css`, `.mobile.css`).
-   You are free to organize CSS files anywhere in your project; the bundler discovers them by name.
-   Each theme has a small config file under `src/themes/<theme>/<theme>.config.json` that declares which base files/vars to include.

### Theme Configuration Files

Each theme requires a configuration file that defines compilation settings and dependencies:

**`themes/default/default.config.json`:**

```json
{
    "includes": [
        "vars/vars",
        "vars/pallette",
        "vars/colors",
        "vars/easing",
        "vars/fonts",
        "vars/screen",
        "vars/sizes",
        "default",
        "utils/utils",
        "utils/stripedArea",
        "utils/comboBox",
        "utils/placeTool",
        "elements/headings",
        "elements/link",
        "elements/scrollbar",
        "elements/lists"
    ],
    "patterns": ["../../../src/components/**/*"]
}
```

**Note**:
'includes' is an explicit ordered list of CSS files (without extensions) to be included in the theme bundle and which reside within the theme directory structure.

'patterns' is an array of glob patterns that define where to look for component CSS files that match the naming conventions described above. Here you are free to organize CSS files anywhere in your project structure - the style bundler will automatically discover them based on the naming convention and the glob 'patterns' you define in the theme config files (as above).

This provides maximum flexibility and loose coupling between components and themes while maintaining a clear structure and minimum overhead.

The use of different stylesheets for each theme reduces the complexity of CSS overrides and specificity wars, as each theme can be simply disabled via the standard HTML attribute method.

**`themes/dark/dark.config.json`:**

```json
{
    "includes": ["dark"]
}
```

**`themes/mobile/mobile.config.json`:**

```json
{
    "includes": ["mobile"]
}
```

For more details on creating custom themes, please refer to the @arpadroid/style-bun documentation:

-   [@arpadroid/style-bun](https://www.npmjs.com/package/@arpadroid/style-bun)

## Internationalization

All components support i18n through the integrated @arpadroid/i18n module:

### Automatic Text Resolution

```html
<!-- Text automatically resolved from i18n keys -->
<arpa-button text-key="buttons.save">Save</arpa-button>
<arpa-dialog title-key="dialogs.confirm.title"></arpa-dialog>
```

### Dynamic Content

```javascript
import { I18n } from '@arpadroid/i18n';

const button = document.querySelector('arpa-button');
button.textContent = I18n.getText('buttons.submit');
```

## API Reference

### ArpaElement Base Class

#### Configuration Options

```typescript
type ArpaElementConfigType = {
    className?: string;
    variant?: string;
    templateChildren?: Record<string, ArpaElementChildOptionsType>;
    removeEmptyZoneNodes?: boolean;
    // ... additional options
};
```

#### Lifecycle Methods

```javascript
class CustomElement extends ArpaElement {
    // ========================================
    // Common Overrides
    // ========================================

    getDefaultConfig() {
        /* Return default configuration - REQUIRED */
    }

    _preInitialize() {
        /* Called first in constructor - ABSTRACT */
    }

    _initialize() {
        /* Called during construction for setup - ABSTRACT */
    }

    getTemplateVars() {
        /* Return variables for template rendering */
    }

    _getTemplate() {
        /* Return your template string - PREFERRED over render() */
    }

    _initializeProperties() {
        /* Called to set up properties - ABSTRACT */
    }

    _onInitialized() {
        /* Called after initialization is complete - ABSTRACT */
    }

    update() {
        /* Called when element needs to update - ABSTRACT */
    }

    _onAttributeChanged(name, oldValue, newValue) {
        /* Custom attribute change handler - ABSTRACT */
    }

    _preRender() {
        /* Called before rendering begins - ABSTRACT */
    }

    _onDestroy() {
        /* Called during cleanup */
    }

    _onPlaceZone(payload) {
        /* Called when zones are placed */
    }

    _onLostZone(payload) {
        /* Called when zones are lost */
    }

    _getTemplate() {
        /* Get the template to render */
    }

    canRender() {
        /* Return true if element can render */
    }

    reRender() {
        /* Force re-render of the element */
    }

    _onConnected() {
        /* Called after element is connected and rendered - ABSTRACT */
    }

    async _initializeNodes() {
        /* Called after render to initialize nodes */
    }

    _onComplete() {
        /* Called at the very end of rendering - ABSTRACT */
    }

    onRendered(callback) {
        /* Register callback for when rendered */
    }

    onRenderReady(callback) {
        /* Register callback for when render-ready */
    }

    onPreRender(callback) {
        /* Register callback for pre-render */
    }
}
```

#### Helper Methods

```javascript
// Property management
element.getProperty('propertyName');
element.hasProperty('propertyName');
element.setProperty('propertyName', value);

// Zone management
element.hasZone('zoneName');
element.getZone('zoneName');

// Event binding
element.bind('methodName');

// Template rendering
element.renderTemplate('templateName');
```

### Component-Specific APIs

#### Button Configuration

```typescript
type ButtonConfigType = {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'tertiary';
    icon?: string;
    rhsIcon?: string;
    loading?: boolean;
    disabled?: boolean;
    href?: string;
    target?: string;
};
```

#### Dialog Configuration

```typescript
type DialogConfigType = {
    title?: string;
    variant?: 'default' | 'large' | 'small' | 'fullscreen';
    open?: boolean;
    persist?: boolean;
    canClose?: boolean;
    backdrop?: boolean;
};
```

#### Pager Configuration

```typescript
type PagerConfigType = {
    id?: string;
    className?: string;
    currentPage?: number;
    totalPages?: number;
    maxNodes?: number;
    hasArrowControls?: boolean;
    adjustSelectedPosition?: boolean;
    urlParam?: string;
    ariaLabel?: string;
    renderMode?: 'default' | 'minimal';
    itemComponent?: string;
    onClick?: (payload: PagerCallbackPayloadType) => void;
};
```

## Advanced Usage

### Custom Component Development

```javascript
import { ArpaElement, defineCustomElement } from '@arpadroid/ui';
// import { observerMixin } from '@arpadroid/tools'; // optional for events

const html = String.raw;

class MyComponent extends ArpaElement {
    static get observedAttributes() {
        return ['title', 'disabled'];
    }

    getDefaultConfig() {
        return {
            className: 'myComponent',
            templateChildren: {
                header: {
                    tag: 'h3',
                    className: 'myComponent__title',
                    canRender: () => !!this.getProperty('title')
                },
                content: {
                    tag: 'div',
                    className: 'myComponent__content',
                    zoneName: 'content',
                    canRender: true
                },
                actions: {
                    tag: 'div',
                    className: 'myComponent__actions',
                    zoneName: 'actions',
                    canRender: () => this.hasZone('actions')
                }
            }
        };
    }

    getTemplate() {
        return html` <section class="myComponent">{header} {content} {actions}</section> `;
    }

    getTemplateVars() {
        return {
            title: this.getProperty('title') || ''
        };
    }

    // Optional: setup for events
    // constructor(cfg) {
    //     super(cfg);
    //     observerMixin(this);
    // }

    // React to attribute changes via framework hook
    _onAttributeChanged(name, _oldValue, newValue) {
        if (name === 'title') {
            this.editChild('header', { content: newValue });
        }
    }
}

defineCustomElement('my-component', MyComponent);
```

### Event Handling

Event payload convention: emit objects with the original browser event plus data, e.g. `signal('change', { event, value, node, files, page })`. Some legacy components may still emit positional arguments (e.g., `(event, files)`); see the component section for details.

```javascript
import { observerMixin } from '@arpadroid/tools';

class InteractiveComponent extends ArpaElement {
    constructor(config) {
        super(config);
        observerMixin(this);
    }

    initializeProperties() {
        // Listen for custom events
        this.on('itemSelected', this.handleItemSelected.bind(this));

        // Emit events
        this.signal('componentReady', { component: this });
    }

    handleItemSelected(data) {
        console.log('Item selected:', data);
    }
}
```

### Advanced Templating

```javascript
class AdvancedComponent extends ArpaElement {
    getTemplateVars() {
        return {
            title: this.getProperty('title'),
            items: this.renderItems(),
            actions: this.hasActions() ? this.renderActions() : ''
        };
    }

    renderItems() {
        const items = this.getProperty('items') || [];
        return items
            .map(
                item => `
            <div class="item" data-id="${item.id}">
                ${item.name}
            </div>
        `
            )
            .join('');
    }
}
```

## Browser Support

-   Chrome 65+
-   Firefox 63+
-   Safari 12+
-   Edge 79+

### Required Features

-   Custom Elements v1
-   Shadow DOM v1 (optional)
-   ES6 Modules
-   CSS Custom Properties

## Development

### Building

```bash
npm run build
```

### Development Server

```bash
npm run storybook
```

### Testing

```bash
npm test
```

## Performance

### Optimization Features

-   **Lazy Loading** - Components load only when needed
-   **Zone Caching** - Template zones are cached for performance
-   **Debounced Updates** - Frequent updates are optimized
-   **Minimal DOM Manipulation** - Efficient rendering strategies

### Best Practices

```javascript
// Wait for custom elements to be defined before using them
await customElements.whenDefined('drop-area');
const dropArea = document.querySelector('drop-area');

// Use observer pattern for event handling
dropArea.on('drop', (event, files) => {
    console.log('Files dropped:', files);
});

// Use icon-button for interactive icons with tooltips
<icon-button
    icon="search"
    variant="minimal"
    tooltip-position="left"
    label="Search">
</icon-button>

// Connect drop-area to file inputs using input-id
<input type="file" id="fileInput" accept="image/*,.pdf" multiple>
<drop-area input-id="fileInput"></drop-area>

// Use zone system for flexible content placement
<arpa-element>
    <zone name="content">
        <!-- Your content here -->
    </zone>
    <zone name="actions">
        <!-- Action buttons here -->
    </zone>
</arpa-element>

// Include Material Symbols for icons
<link rel="stylesheet" href="material-symbols/outlined.css" />

// Use attrString helper for dynamic attributes in templates
import { attrString } from '@arpadroid/tools';
const html = String.raw;
return html`<icon-button ${attrString(args)}></icon-button>`;
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { ArpaElement, Button, Dialog, ArpaElementConfigType, ButtonConfigType } from '@arpadroid/ui';

const button: Button = document.querySelector('arpa-button')!;
const config: ButtonConfigType = {
    variant: 'primary',
    icon: 'settings',
    disabled: false
};

button.updateConfig(config);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Arpadroid](https://github.com/arpadroid)

## Related Packages

-   [@arpadroid/tools](https://www.npmjs.com/package/@arpadroid/tools) - Utility functions and helpers
-   [@arpadroid/i18n](https://www.npmjs.com/package/@arpadroid/i18n) - Internationalization support
-   [@arpadroid/forms](https://www.npmjs.com/package/@arpadroid/forms) - Form components and validation
-   [@arpadroid/lists](https://www.npmjs.com/package/@arpadroid/lists) - Data display and list components
