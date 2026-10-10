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
    document.querySelectorAll('.option .opt-icon').forEach(function (node) {
      setIcon(node, /card/i.test(node.closest('.option').textContent) ? 'credit-card' : 'qr-code', 'ui-icon--md');
    });
    document.querySelectorAll('.quick-row a').forEach(function (link) {
      var names = {activity:'package',history:'clipboard-list',concern:'circle-plus',referral:'user-plus'};
      setIcon(link.querySelector('.qic'), names[link.dataset.go] || 'circle-plus', 'ui-icon--md');
    });
    document.querySelectorAll('.bottomnav a').forEach(function (link) {
      var target = link.dataset.go || '';
      var name = target === 'profile' ? 'user-round' : target.includes('activit') || target === 'tracking' ? 'package' :
        target === 'notifications' ? 'bell' : target === 'settings' ? 'sliders-horizontal' : 'house';
      setIcon(link.querySelector('.ic'), name, 'ui-icon--md');
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
    document.querySelectorAll('.call-btn').forEach(function (node) {
      var text = (node.getAttribute('aria-label') || node.title || node.textContent).toLowerCase();
      var name = text.includes('end') || text.includes('วาง') ? 'phone-off' : text.includes('video') || text.includes('กล้อง') ? 'video' : text.includes('mic') || text.includes('ไมค์') ? 'mic' : 'phone';
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
    if (iconObserver && document.body) {
      iconObserver.observe(document.body, {childList:true, subtree:true});
    }
  }

  function runNormalize() {
    if (iconObserver) iconObserver.disconnect();
    normalize();
    observeIcons();
  }

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
