(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.VeriTaktDirectory = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function filterEntries(entries, query, category, verifiedOnly) {
    var q = String(query || "").trim().toLowerCase();
    var cat = String(category || "all").trim();
    var ver = Boolean(verifiedOnly);

    var out = (entries || []).filter(function (item) {
      if (cat && cat !== "all" && item.category !== cat) return false;
      if (ver && !item.verified) return false;
      if (!q) return true;
      var hay = [
        item.name,
        item.tagline,
        item.category_name || item.category,
        item.pricing_model,
        item.target_region,
        (item.highlights || []).join(" ")
      ]
        .join(" ")
        .toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    out.sort(function (a, b) {
      if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
      if (Boolean(a.verified) !== Boolean(b.verified)) return a.verified ? -1 : 1;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    return out;
  }

  function initBrowserDirectory() {
    if (typeof document === "undefined") return;
    var grid = document.getElementById("directory-grid");
    var dataEl = document.getElementById("directory-data");
    if (!grid || !dataEl) return;

    var entries = JSON.parse(dataEl.textContent || "[]");
    var searchEl = document.getElementById("dir-search");
    var catEl = document.getElementById("dir-category");
    var verEl = document.getElementById("dir-verified");
    var countEl = document.getElementById("dir-count");

    function esc(v) {
      return String(v == null ? "" : v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function render() {
      var list = filterEntries(
        entries,
        searchEl ? searchEl.value : "",
        catEl ? catEl.value : "all",
        verEl ? verEl.checked : false
      );
      if (countEl) {
        countEl.textContent = list.length + " of " + entries.length + " listings shown";
      }
      if (!list.length) {
        grid.innerHTML = '<div class="card"><strong>No matching listings.</strong><p>Try clearing your filter or submit a listing via Sponsor.</p></div>';
        return;
      }
      grid.innerHTML = list
        .map(function (e) {
          var badges =
            (e.featured ? '<span class="pill pill-amber">Featured</span> ' : "") +
            (e.verified ? '<span class="pill pill-emerald">Verified</span> ' : "") +
            '<span class="pill">' + esc(e.category_name || e.category) + "</span>";
          return (
            '<article class="card' + (e.featured ? " card-featured" : "") + '">' +
            '  <div class="meta-row">' + badges + "</div>" +
            '  <h3 style="margin:2px 0;"><a href="./listings/' + esc(e.slug) + '/">' + esc(e.name) + "</a></h3>" +
            '  <p style="margin:0; color:var(--text-sec); font-size:14px;">' + esc(e.tagline) + "</p>" +
            '  <div class="meta-row"><span>' + esc(e.pricing_model) + "</span> &middot; <span>" + esc(e.target_region) + "</span></div>" +
            '  <div style="margin-top:auto; padding-top:6px;"><a class="btn" href="./listings/' + esc(e.slug) + '/">View Details</a></div>' +
            "</article>"
          );
        })
        .join("");
    }

    if (searchEl) searchEl.addEventListener("input", render);
    if (catEl) catEl.addEventListener("change", render);
    if (verEl) verEl.addEventListener("change", render);
    render();
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initBrowserDirectory);
  }

  return { filterEntries: filterEntries };
});
