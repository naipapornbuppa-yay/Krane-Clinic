(function () {
  'use strict';

  function icon(name, sizeClass) {
    return '<i data-lucide="' + name + '" class="ui-icon ' + (sizeClass || 'ui-icon--md') + '" aria-hidden="true"></i>';
  }
  window.kraneIcon = icon;

  function setIcon(node, name, sizeClass) {
    if (!node || node.dataset.iconReady) return;
    node.dataset.iconReady = name;
    node.innerHTML = icon(name, sizeClass);
  }

  // Both states share one outer contour, so selection changes only the fill,
  // never the house, parcel or person silhouette. Motion stays on the SVG.
  var navMaskCounter = 0;
  function setNavPairedIcon(node, name, active) {
    if (!node || node.dataset.iconReady) return;
    var maskId = 'krane-nav-cutout-' + name + '-' + (++navMaskCounter);
    var outer = name === 'house'
      ? 'M11.1 2.8a1.5 1.5 0 0 1 1.8 0L21 8.9a1.5 1.5 0 0 1 .6 1.2v9.7a1.7 1.7 0 0 1-1.7 1.7H4.1a1.7 1.7 0 0 1-1.7-1.7v-9.7c0-.5.2-.9.6-1.2l8.1-6.1Z'
      : 'M11.25 2.65a1.7 1.7 0 0 1 1.5 0l7.9 4a1.7 1.7 0 0 1 .85 1.47v8.76a1.7 1.7 0 0 1-.85 1.47l-7.9 4a1.7 1.7 0 0 1-1.5 0l-7.9-4a1.7 1.7 0 0 1-.85-1.47V8.12a1.7 1.7 0 0 1 .85-1.47l7.9-4Z';
    if (name === 'user-round') {
      node.dataset.iconReady = name;
      node.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="ui-icon ui-icon--md nav-icon--paired" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<circle cx="12" cy="7.4" r="4" fill="' + (active ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.9"/>' +
        '<path d="M4.2 20.7v-.8c0-3.45 3.5-6.1 7.8-6.1s7.8 2.65 7.8 6.1v.8Z" fill="' + (active ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>';
      return;
    }
    var cutout = name === 'house'
      ? '<path d="M4.3 10.5 12 4.7l7.7 5.8" fill="none" stroke="#000" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.8 21.5v-6.1a2.2 2.2 0 0 1 4.4 0v6.1Z" fill="#000" stroke="none"/>'
      : '<path d="M3.2 7.35 12 11.85l8.8-4.5M12 11.85v9.35" fill="none" stroke="#000" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>';
    node.dataset.iconReady = name;
    if (active) {
      node.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="ui-icon ui-icon--md nav-icon--paired nav-icon--negative" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<defs><mask id="' + maskId + '" x="0" y="0" width="24" height="24" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">' +
        '<rect x="0" y="0" width="24" height="24" fill="#fff" stroke="none"/>' + cutout + '</mask></defs>' +
        '<path d="' + outer + '" fill="currentColor" stroke="none" mask="url(#' + maskId + ')"/></svg>';
    } else {
      var detail = name === 'house'
        ? '<path d="M4.3 10.5 12 4.7l7.7 5.8M9.8 21.5v-6.1a2.2 2.2 0 0 1 4.4 0v6.1"/>'
        : '<path d="M3.2 7.35 12 11.85l8.8-4.5M12 11.85v9.35"/>';
      node.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="ui-icon ui-icon--md nav-icon--paired" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="' + outer + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + detail + '</g></svg>';
    }
  }

  function replaceFirstSvg(node, name, sizeClass) {
    if (!node || node.dataset.iconReady) return;
    var current = node.querySelector('svg:not([data-qr])');
    if (!current) return;
    node.dataset.iconReady = name;
    current.outerHTML = icon(name, sizeClass);
  }

  function normalize() {
    document.querySelectorAll('.screen__top .back').forEach(function (node) {
      setIcon(node, 'arrow-left', 'ui-icon--md');
      if (!node.hasAttribute('aria-label')) node.setAttribute('aria-label', 'Back');
    });
    document.querySelectorAll('.map-toggle>summary .chev').forEach(function (node) { setIcon(node, 'chevron-down', 'ui-icon--sm'); });
    document.querySelectorAll('.chev:not([data-icon-ready])').forEach(function (node) { setIcon(node, 'chevron-right', 'ui-icon--sm'); });
    document.querySelectorAll('.choice-card .cc-chev').forEach(function (node) { setIcon(node, 'arrow-right', 'ui-icon--sm'); });
    document.querySelectorAll('.list-row > .muted:last-child').forEach(function (node) {
      if (node.textContent.trim() === '›') setIcon(node, 'chevron-right', 'ui-icon--sm');
    });
    document.querySelectorAll('.alert .a-ic').forEach(function (node) {
      var alert = node.closest('.alert');
      var name = alert.classList.contains('alert--success') ? 'circle-check' :
        (alert.classList.contains('alert--warning') || alert.classList.contains('alert--danger')) ? 'triangle-alert' : 'info';
      setIcon(node, name, 'ui-icon--sm');
    });
    document.querySelectorAll('.upload .up-ic').forEach(function (node) { setIcon(node, 'upload', 'ui-icon--md'); });
    document.querySelectorAll('.up-thumb').forEach(function (node) { replaceFirstSvg(node, 'image', 'ui-icon--md'); });
    document.querySelectorAll('.up-thumb .x').forEach(function (node) { setIcon(node, 'x', 'ui-icon--xs'); });
    document.querySelectorAll('.kv-edit').forEach(function (node) { setIcon(node, 'pencil', 'ui-icon--xs'); });
    document.querySelectorAll('.gw-lock,.gw-foot').forEach(function (node) { replaceFirstSvg(node, 'lock-keyhole', 'ui-icon--xs'); });
    document.querySelectorAll('.map-pin').forEach(function (node) { setIcon(node, 'map-pin', 'ui-icon--lg'); });
    document.querySelectorAll('.map-cta').forEach(function (node) { replaceFirstSvg(node, 'locate-fixed', 'ui-icon--sm'); });
    document.querySelectorAll('.ac-ic').forEach(function (node) { setIcon(node, 'map-pin', 'ui-icon--sm'); });
    /* This dates from when the only .option with an icon was a payment method,
       so everything else it reaches — the pickup branch list, for one — was
       being stamped with a QR code (client, 23 Sep). An option that names its
       own icon in the markup keeps it; the payment default is only the fallback
       for the ones that never named one. */
    document.querySelectorAll('.option .opt-icon').forEach(function (node) {
      var declared = node.querySelector('[data-lucide]');
      if (declared) { node.dataset.iconReady = declared.getAttribute('data-lucide'); return; }
      setIcon(node, /card/i.test(node.closest('.option').textContent) ? 'credit-card' : 'qr-code', 'ui-icon--md');
    });
    document.querySelectorAll('.quick-row a').forEach(function (link) {
      var names = {activity:'package',history:'clipboard-list',concern:'circle-plus',referral:'user-plus'};
      setIcon(link.querySelector('.qic'), names[link.dataset.go] || 'circle-plus', 'ui-icon--md');
    });
    document.querySelectorAll('.bottomnav a').forEach(function (link) {
      var target = link.dataset.go || '';
      // The first tab is the home dashboard, not a profile, and the last tab is the
      // account (client, 13 Sep). This script paints over the inline sprite, so the
      // glyphs have to change here too.
      var name = target === 'profile' ? 'house' : target.includes('activit') || target === 'tracking' ? 'package' :
        target === 'notifications' ? 'bell' : target === 'settings' ? 'user-round' : 'house';
      if (name === 'house' || name === 'package' || name === 'user-round') {
        setNavPairedIcon(link.querySelector('.ic'), name, link.getAttribute('aria-current') === 'page');
      } else {
        setIcon(link.querySelector('.ic'), name, 'ui-icon--md');
      }
    });
    document.querySelectorAll('.notif').forEach(function (row) {
      var name = row.dataset.go === 'tracking' ? 'truck' : row.dataset.go === 'consult' ? 'messages-square' :
        row.dataset.go === 'plan' ? 'clipboard-check' : row.dataset.go === 'profile' ? 'clock-3' : 'bell';
      setIcon(row.querySelector('.ic'), name, 'ui-icon--md');
    });
    document.querySelectorAll('.setting-row').forEach(function (row) {
      var text = row.textContent.toLowerCase();
      var name = row.dataset.go === 'account' ? 'user-round' : row.dataset.go === 'address' ? 'map-pin' : row.dataset.go === 'payment' ? 'credit-card' :
        row.dataset.go === 'landing' ? 'log-out' : text.includes('language') ? 'languages' : text.includes('order update') ? 'bell' :
        text.includes('doctor message') ? 'messages-square' : text.includes('refill') ? 'clock-3' : text.includes('privacy') ? 'shield-check' :
        text.includes('help') ? 'circle-help' : 'sliders-horizontal';
      setIcon(row.querySelector('.ic'), name, 'ui-icon--sm');
    });
    document.querySelectorAll('.avatar--brand').forEach(function (node) { setIcon(node, 'shield-check', 'ui-icon--md'); });
    document.querySelectorAll('.thumb--brand').forEach(function (node) { setIcon(node, 'pill', 'ui-icon--md'); });
    // Each call control names its own icon (data-call-icon), rather than guessing from
    // button text: "Mute", "Cam off" and "Chat" share no keyword, which silently fell
    // through to the same default "phone" glyph on every button but End.
    document.querySelectorAll('.call-btn[data-call-icon],.call-fab[data-call-icon]').forEach(function (node) {
      var pressed = node.getAttribute('aria-pressed') === 'true';
      var name = (pressed && node.dataset.callIconPressed) || node.dataset.callIcon;
      node.dataset.iconReady = ''; // allow re-icon on press toggle
      setIcon(node, name, 'ui-icon--md');
    });
    document.querySelectorAll('[data-demo-icon]').forEach(function (node) {
      setIcon(node, node.dataset.demoIcon, node.dataset.iconSize || 'ui-icon--md');
    });

    if (window.lucide && document.querySelector('i[data-lucide]')) {
      window.lucide.createIcons({
        icons: window.lucide.icons,
        attrs: {'stroke-width':'1.8','aria-hidden':'true'}
      });
    }
  }

  var iconObserver;
  var iconNormalizePending = false;

  function observeIcons() {
    var iconRoot = document.body;
    if (iconObserver && iconRoot) {
      iconObserver.observe(iconRoot, {childList:true, subtree:true});
    }
  }

  function runNormalize() {
    if (iconObserver) iconObserver.disconnect();
    normalize();
    observeIcons();
  }
  window.krane_normalizeIcons = runNormalize;

  iconObserver = new MutationObserver(function () {
    if (iconNormalizePending) return;
    iconNormalizePending = true;
    window.requestAnimationFrame(function () {
      iconNormalizePending = false;
      runNormalize();
    });
  });

  runNormalize();
  window.kraneNormalizeIcons = runNormalize;
})();
