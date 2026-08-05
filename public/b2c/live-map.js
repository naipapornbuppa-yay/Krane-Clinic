/* Real map for the delivery address screen.

   OpenStreetMap raster tiles and Nominatim reverse geocoding. No API key, no
   billing, no account. Both are free services run on donated capacity, so this
   file holds to their usage policies: tiles carry the required attribution, and
   reverse geocoding is debounced to at most one request a second and only fires
   when the map has settled, never mid-drag.

   Leaflet is not used. This session cannot reach a CDN to vendor it, and the
   screen needs one behaviour only: a centred pin over pannable tiles. The Web
   Mercator maths for that is about thirty lines, below.

   Everything here is best-effort. If tiles fail, geolocation is denied, or
   Nominatim does not answer, the caller keeps its simulated map and its five
   demo addresses. The prototype must never lose its address screen because a
   free service was slow. */
(function () {
  "use strict";

  var TILE = 256;
  var MIN_Z = 3, MAX_Z = 19;
  var NOMINATIM = "https://nominatim.openstreetmap.org/reverse";
  var GEOCODE_MIN_GAP_MS = 1100;   // Nominatim asks for <= 1 req/sec
  var GEOCODE_TIMEOUT_MS = 6000;

  /* ---- Web Mercator ---- */
  function lngToTileX(lng, z) { return (lng + 180) / 360 * Math.pow(2, z); }
  function latToTileY(lat, z) {
    var r = lat * Math.PI / 180;
    return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z);
  }
  function tileXToLng(x, z) { return x / Math.pow(2, z) * 360 - 180; }
  function tileYToLat(y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---- Tile layer ---- */
  function LiveMap(host, options) {
    options = options || {};
    this.host = host;
    this.lat = options.lat;
    this.lng = options.lng;
    this.z = options.zoom || 17;
    this.onSettle = options.onSettle || function () {};
    this.settleTimer = 0;
    this.tiles = Object.create(null);
    this.failed = 0;
    this.loaded = 0;

    this.layer = document.createElement("div");
    this.layer.className = "live-map__layer";
    this.layer.setAttribute("aria-hidden", "true");

    this.credit = document.createElement("a");
    this.credit.className = "live-map__credit";
    this.credit.href = "https://www.openstreetmap.org/copyright";
    this.credit.target = "_blank";
    this.credit.rel = "noopener";
    this.credit.textContent = "© OpenStreetMap";

    host.insertBefore(this.layer, host.firstChild);
    host.appendChild(this.credit);
    this.bindPan();
    this.render();
  }

  LiveMap.prototype.size = function () {
    var r = this.host.getBoundingClientRect();
    return { w: r.width || 360, h: r.height || 260 };
  };

  LiveMap.prototype.render = function () {
    var size = this.size();
    var cx = lngToTileX(this.lng, this.z);
    var cy = latToTileY(this.lat, this.z);
    var half = Math.pow(2, this.z);
    var cols = Math.ceil(size.w / TILE) + 2;
    var rows = Math.ceil(size.h / TILE) + 2;
    var x0 = Math.floor(cx - cols / 2);
    var y0 = Math.floor(cy - rows / 2);
    var wanted = Object.create(null);

    for (var i = 0; i <= cols; i++) {
      for (var j = 0; j <= rows; j++) {
        var tx = x0 + i, ty = y0 + j;
        if (ty < 0 || ty >= half) continue;
        var wx = ((tx % half) + half) % half;          // wrap east/west
        var key = this.z + "/" + wx + "/" + ty;
        wanted[key] = true;
        var img = this.tiles[key];
        if (!img) {
          img = document.createElement("img");
          img.className = "live-map__tile";
          img.alt = "";
          img.loading = "eager";
          img.decoding = "async";
          img.src = "https://tile.openstreetmap.org/" + this.z + "/" + wx + "/" + ty + ".png";
          img.addEventListener("load", this.onTileLoad.bind(this));
          img.addEventListener("error", this.onTileError.bind(this));
          this.layer.appendChild(img);
          this.tiles[key] = img;
        }
        img.style.transform = "translate3d(" +
          ((tx - cx) * TILE + size.w / 2) + "px," +
          ((ty - cy) * TILE + size.h / 2) + "px,0)";
      }
    }
    for (var k in this.tiles) {
      if (!wanted[k]) { this.tiles[k].remove(); delete this.tiles[k]; }
    }
  };

  LiveMap.prototype.onTileLoad = function () {
    this.loaded += 1;
    this.host.classList.add("is-live");
  };

  /* Tiles that never arrive mean no network, a blocked host, or a service under
     load. Rather than leave a blank rectangle where a map should be, hand the
     screen back to the simulated grid it shipped with. */
  LiveMap.prototype.onTileError = function () {
    this.failed += 1;
    if (this.loaded === 0 && this.failed >= 3) this.destroy(true);
  };

  LiveMap.prototype.destroy = function (report) {
    if (this.dead) return;
    this.dead = true;
    this.layer.remove();
    this.credit.remove();
    this.host.classList.remove("is-live");
    if (report && typeof this.onFail === "function") this.onFail();
  };

  LiveMap.prototype.setView = function (lat, lng, z) {
    this.lat = lat; this.lng = lng;
    if (z) this.z = clamp(z, MIN_Z, MAX_Z);
    this.render();
  };

  LiveMap.prototype.zoomBy = function (delta) {
    this.z = clamp(this.z + delta, MIN_Z, MAX_Z);
    this.render();
    this.settle();
  };

  LiveMap.prototype.panBy = function (dxPx, dyPx) {
    var scale = Math.pow(2, this.z);
    var cx = lngToTileX(this.lng, this.z) - dxPx / TILE;
    var cy = latToTileY(this.lat, this.z) - dyPx / TILE;
    cy = clamp(cy, 0, scale);
    this.lng = tileXToLng(cx, this.z);
    this.lat = tileYToLat(cy, this.z);
    this.render();
  };

  LiveMap.prototype.settle = function () {
    var self = this;
    window.clearTimeout(this.settleTimer);
    this.settleTimer = window.setTimeout(function () {
      if (!self.dead) self.onSettle(self.lat, self.lng);
    }, 260);
  };

  LiveMap.prototype.bindPan = function () {
    var self = this, active = false, lx = 0, ly = 0;
    this.host.addEventListener("pointerdown", function (e) {
      if (self.dead || e.target.closest("[data-sim-zoom],[data-sim-locate],.live-map__credit")) return;
      active = true; lx = e.clientX; ly = e.clientY;
      self.host.classList.add("is-panning");
      if (self.host.setPointerCapture) { try { self.host.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    this.host.addEventListener("pointermove", function (e) {
      if (!active) return;
      self.panBy(e.clientX - lx, e.clientY - ly);
      lx = e.clientX; ly = e.clientY;
    });
    function end() {
      if (!active) return;
      active = false;
      self.host.classList.remove("is-panning");
      self.settle();
    }
    this.host.addEventListener("pointerup", end);
    this.host.addEventListener("pointercancel", end);
    this.host.addEventListener("pointerleave", end);
  };

  /* ---- Reverse geocoding ---- */
  var lastGeocodeAt = 0;

  function reverseGeocode(lat, lng) {
    var wait = Math.max(0, GEOCODE_MIN_GAP_MS - (Date.now() - lastGeocodeAt));
    return new Promise(function (resolve, reject) {
      window.setTimeout(function () {
        lastGeocodeAt = Date.now();
        var ctl = typeof AbortController === "function" ? new AbortController() : null;
        var timer = window.setTimeout(function () { if (ctl) ctl.abort(); }, GEOCODE_TIMEOUT_MS);
        var url = NOMINATIM + "?format=jsonv2&zoom=18&addressdetails=1" +
          "&lat=" + encodeURIComponent(lat) + "&lon=" + encodeURIComponent(lng) +
          "&accept-language=th";
        fetch(url, { headers: { Accept: "application/json" }, signal: ctl ? ctl.signal : undefined })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)); })
          .then(function (data) {
            window.clearTimeout(timer);
            var place = normalise(data);
            place ? resolve(place) : reject(new Error("no address"));
          })
          .catch(function (err) { window.clearTimeout(timer); reject(err); });
      }, wait);
    });
  }

  /* Nominatim's Thai fields do not line up one to one with the form. Bangkok
     returns แขวง as suburb or quarter and เขต as city_district or suburb
     depending on the road, so each field takes the first key that answers. */
  function normalise(data) {
    if (!data || !data.address) return null;
    var a = data.address;
    var building = a.building || a.amenity || a.shop || a.office || a.house_name || "";
    var houseNumber = a.house_number || "";
    var road = a.road || a.pedestrian || a.residential || "";
    if (!building && houseNumber) building = houseNumber;
    else if (building && houseNumber) building = building + " " + houseNumber;

    var place = {
      building: building || road || (data.name || ""),
      floor: "",
      line: road || "",
      subdistrict: a.suburb || a.quarter || a.neighbourhood || a.village || "",
      districtName: a.city_district || a.district || a.county || a.town || "",
      province: a.province || a.state || a.city || "",
      postcode: a.postcode || ""
    };
    if (!place.building && !place.line) return null;
    place.title = place.building || place.line;
    return place;
  }

  function locate() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) return reject(new Error("unsupported"));
      navigator.geolocation.getCurrentPosition(
        function (pos) { resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        function (err) { reject(err); },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  window.KraneLiveMap = {
    create: function (host, options) { return new LiveMap(host, options); },
    reverseGeocode: reverseGeocode,
    locate: locate,
    // exported for tests
    _lngToTileX: lngToTileX,
    _latToTileY: latToTileY,
    _tileXToLng: tileXToLng,
    _tileYToLat: tileYToLat,
    _normalise: normalise
  };
})();
