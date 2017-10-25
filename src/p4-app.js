class P4App extends Polymer.Element {
  static get is() {
    return 'p4-app';
  }

  static get properties() {
    return {
      page: {
        type: String,
        observer: '_pageChanged',
      },
      routeData: Object,
      subRoute: Object,
    };
  }

  static get observers() {
    return ['_routePageChanged(routeData.page)'];
  }

  ready() {
    super.ready();
    this.$.auth.signInAnonymously();
  }

  _routePageChanged(page) {
    this.page = page || 'start';
  }

  _pageChanged(page) {
    // console.log(page);
    if (page != null) {
      // home route is eagerly loaded
      if (page === 'start') {
        this._pageLoaded();
        // other routes are lazy loaded
      } else {
        // When a load failed, it triggered a 404 which means we need to
        // eagerly load the 404 page definition
        const cb = this._pageLoaded.bind(this);
        Polymer.importHref(this.resolveUrl(`pages/p4-${page}-page.html`), cb, cb, true);
      }
    }
  }

  _pageLoaded() {
    this._ensureLazyLoaded();
  }

  _ensureLazyLoaded() {
    // load lazy resources after render and set `loadComplete` when done.
    if (!this.loadComplete) {
      Polymer.RenderStatus.afterNextRender(this, () => {
        Polymer.importHref(this.resolveUrl('lazy-resources.html'), () => {
          // Register service worker if supported.
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js', { scope: '/' });
          }
          this._notifyNetworkStatus();
          this.loadComplete = true;
        });
      });
    }
  }

  _notifyNetworkStatus() {
    const oldOffline = this.offline;
    this.offline = !navigator.onLine;
    // Show the snackbar if the user is offline when starting a new session
    // or if the network status changed.
    if (this.offline || (!this.offline && oldOffline === true)) {
      if (!this._networkSnackbar) {
        this._networkSnackbar = document.createElement('shop-snackbar');
        this.root.appendChild(this._networkSnackbar);
      }
      this._networkSnackbar.innerHTML = this.offline ? 'You are offline' : 'You are online';
      this._networkSnackbar.open();
    }
  }

  _toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  _setMeta(attrName, attrValue, content) {
    let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content || '');
  }

  // Elements in the app can notify section changes.
  // Response by a11y announcing the section and syncronizing the category.
  _onChangeSection(event) {
    const { detail } = event;

    // Scroll to the top of the page when navigating to a non-list page. For list view,
    // scroll to the last saved position only if the category has not changed.
    let scrollTop = 0;
    if (this.page === 'list') {
      if (this.categoryName === detail.category) {
        scrollTop = this._listScrollTop;
      } else {
        // Reset the list view scrollTop if the category changed.
        this._listScrollTop = 0;
      }
    }
    // Use `Polymer.AppLayout.scroll` with `behavior: 'silent'` to disable header scroll
    // effects during the scroll.
    Polymer.AppLayout.scroll({ top: scrollTop, behavior: 'silent' });

    this.categoryName = detail.category || '';

    // Announce the page's title
    if (detail.title) {
      document.title = `${detail.title} - SHOP`;
      this._announce(`${detail.title}, loaded`);
      // Set open graph metadata
      this._setMeta('property', 'og:title', detail.title);
      this._setMeta('property', 'og:description', detail.description || document.title);
      this._setMeta('property', 'og:url', document.location.href);
      this._setMeta(
        'property',
        'og:image',
        detail.image || `${this.baseURI}images/shop-icon-128.png`
      );
      // Set twitter card metadata
      this._setMeta('property', 'twitter:title', detail.title);
      this._setMeta('property', 'twitter:description', detail.description || document.title);
      this._setMeta('property', 'twitter:url', document.location.href);
      this._setMeta(
        'property',
        'twitter:image:src',
        detail.image || `${this.baseURI}images/shop-icon-128.png`
      );
    }
  }
}

customElements.define(P4App.is, P4App);
