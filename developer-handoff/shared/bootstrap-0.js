
  (() => {
    const release = "20261010-shared-views-v272";
    const url = new URL(window.location.href);
    let canonicalized = false;
    /* Two versions of this app, and the URL should say which one you are on:
       ?screens=1 carries the screen inventory down the side, no parameter is
       the plain patient app. Older links — only-me=1, with_screen_tab=1 —
       keep working and are rewritten to it (client, 6 Oct). */
    if (url.searchParams.get("only-me") === "1" || url.searchParams.get("with_screen_tab") === "1") {
      url.searchParams.set("screens", "1");
      url.searchParams.delete("only-me");
      url.searchParams.delete("with_screen_tab");
      canonicalized = true;
    }
    if (url.searchParams.get('entry') === 'partner' && (!url.hash || url.hash === '#landing')) {
      url.searchParams.set('fresh', '1');
      url.hash = 'consent-terms';
      canonicalized = true;
    }
    const initialRoute = url.hash.slice(1).split('?')[0] || 'landing';
    const landing = initialRoute === 'landing';
    const illustrationSet = url.searchParams.get('illustrationSet') === 'wash' ? 'wash' : 'mono';
    document.documentElement.dataset.landingCanvas = String(landing);
    document.documentElement.dataset.illustrationSet = illustrationSet;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', landing ? '#5871B5' : '#F7F7F7');
    if (/^https?:$/.test(url.protocol) && (url.searchParams.get("v") !== release || canonicalized)) {
      url.searchParams.set("v", release);
      window.location.replace(url.href);
    }
  })();
