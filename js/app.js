/* 探究筆記：首頁列表與單則筆記渲染。資料格式見 AGENTS.md。 */
(function (global) {
  "use strict";

  var INDEX_URL = "data/index.json";

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function relatedLabel(n) {
    var score = Number(n) || 0;
    var filled = "●".repeat(Math.max(0, Math.min(5, score)));
    var empty = "○".repeat(Math.max(0, 5 - score));
    return { text: "關聯 " + filled + empty, score: score };
  }

  function relatedClass(score) {
    if (score >= 5) return "related";
    if (score >= 3) return "related is-mid";
    return "related is-low";
  }

  function uniqueTags(notes) {
    var seen = {};
    var out = [];
    notes.forEach(function (note) {
      (note.tags || []).forEach(function (tag) {
        if (!seen[tag]) {
          seen[tag] = true;
          out.push(tag);
        }
      });
    });
    return out;
  }

  function parseFrontMatter(text) {
    var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return { meta: {}, body: text };
    var meta = {};
    var currentKey = null;
    match[1].split(/\r?\n/).forEach(function (line) {
      var listItem = line.match(/^\s+-\s+(.*)$/);
      if (listItem && currentKey && Array.isArray(meta[currentKey])) {
        var item = listItem[1].trim().replace(/^["']|["']$/g, "");
        meta[currentKey].push(item);
        return;
      }
      var kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (!kv) return;
      currentKey = kv[1];
      var raw = kv[2].trim();
      if (raw === "") {
        meta[currentKey] = [];
        return;
      }
      if (
        (raw.charAt(0) === '"' && raw.charAt(raw.length - 1) === '"') ||
        (raw.charAt(0) === "'" && raw.charAt(raw.length - 1) === "'")
      ) {
        raw = raw.slice(1, -1);
      }
      if (/^-?\d+$/.test(raw)) {
        meta[currentKey] = Number(raw);
      } else {
        meta[currentKey] = raw;
      }
    });
    return { meta: meta, body: match[2] };
  }

  function formatBiblio(meta) {
    var parts = [];
    if (meta.authors) parts.push(escapeHtml(meta.authors));
    if (meta.year) parts.push("(" + escapeHtml(meta.year) + ").");
    if (meta.title) parts.push(escapeHtml(meta.title) + ".");
    var venue = "";
    if (meta.venue) {
      venue = "<span class=\"venue-em\">" + escapeHtml(meta.venue) + "</span>";
      var issueBits = [];
      if (meta.volume) issueBits.push(escapeHtml(meta.volume));
      if (meta.issue) issueBits[0] = (issueBits[0] || "") + "(" + escapeHtml(meta.issue) + ")";
      if (issueBits.length) venue += ", " + issueBits.join("");
      if (meta.pages) venue += ", " + escapeHtml(meta.pages);
      venue += ".";
    }
    if (venue) parts.push(venue);
    return parts.join(" ");
  }

  function renderIndex() {
    var listEl = $("list");
    if (!listEl) return;

    fetch(INDEX_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("無法載入目錄（" + res.status + "）");
        return res.json();
      })
      .then(function (data) {
        var notes = data.notes || [];
        var qInput = $("q");
        var tagBar = $("tag-bar");
        var countEl = $("count");
        var emptyEl = $("empty");
        var clearBtn = $("clear-filters");
        var activeTag = "";

        function apply() {
          var q = (qInput && qInput.value ? qInput.value : "").trim().toLowerCase();
          var shown = notes.filter(function (note) {
            if (activeTag && (note.tags || []).indexOf(activeTag) === -1) return false;
            if (!q) return true;
            var hay = [
              note.title,
              note.title_zh,
              note.authors,
              note.venue,
              note.summary,
              String(note.year),
              (note.tags || []).join(" ")
            ]
              .join(" ")
              .toLowerCase();
            return hay.indexOf(q) !== -1;
          });

          countEl.textContent = "共 " + notes.length + " 則筆記" + (shown.length !== notes.length ? "，顯示 " + shown.length + " 則" : "");
          clearBtn.hidden = !activeTag && !q;

          if (tagBar) {
            Array.prototype.forEach.call(tagBar.querySelectorAll(".tag-filter"), function (btn) {
              var on = btn.getAttribute("data-tag") === activeTag;
              btn.classList.toggle("is-on", on);
              btn.setAttribute("aria-pressed", on ? "true" : "false");
            });
          }

          if (!shown.length) {
            listEl.innerHTML = "";
            emptyEl.hidden = false;
            return;
          }
          emptyEl.hidden = true;
          listEl.innerHTML = shown.map(cardHtml).join("");
        }

        function cardHtml(note) {
          var rel = relatedLabel(note.related);
          var tags = (note.tags || [])
            .map(function (t) {
              return '<span class="tag">' + escapeHtml(t) + "</span>";
            })
            .join("");
          return (
            '<a class="card" href="note.html?id=' +
            encodeURIComponent(note.id) +
            '">' +
            '<div class="card-top"><span class="year">' +
            escapeHtml(note.year) +
            '</span><span class="' +
            relatedClass(rel.score) +
            '">' +
            escapeHtml(rel.text) +
            "</span></div>" +
            "<h2>" +
            escapeHtml(note.title_zh || note.title) +
            "</h2>" +
            (note.title_zh
              ? '<p class="title-en">' + escapeHtml(note.title) + "</p>"
              : "") +
            '<p class="authors">' +
            escapeHtml(note.authors) +
            "</p>" +
            '<p class="venue">' +
            escapeHtml(note.venue) +
            "</p>" +
            '<p class="summary">' +
            escapeHtml(note.summary || "") +
            "</p>" +
            '<div class="tags">' +
            tags +
            "</div>" +
            "</a>"
          );
        }

        uniqueTags(notes).forEach(function (tag) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "tag-filter";
          btn.setAttribute("data-tag", tag);
          btn.setAttribute("aria-pressed", "false");
          btn.textContent = tag;
          btn.addEventListener("click", function () {
            activeTag = activeTag === tag ? "" : tag;
            apply();
          });
          tagBar.appendChild(btn);
        });

        if (qInput) qInput.addEventListener("input", apply);
        if (clearBtn) {
          clearBtn.addEventListener("click", function () {
            activeTag = "";
            if (qInput) qInput.value = "";
            apply();
          });
        }
        apply();
      })
      .catch(function (err) {
        listEl.innerHTML =
          '<p class="error">目錄載入失敗。請改用本機伺服器開啟本站（例如 <code>python3 -m http.server 8000</code>），不要直接用 file:// 開檔。' +
          (err && err.message ? "<br>" + escapeHtml(err.message) : "") +
          "</p>";
      });
  }

  function queryId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }

  function renderNote() {
    var root = $("note-root");
    if (!root) return;
    var id = queryId();
    if (!id || /[^\w.-]/.test(id)) {
      root.innerHTML =
        '<div class="error"><p>找不到這則筆記。請從<a href="index.html">全部筆記</a>進入。</p></div>';
      return;
    }

    var mdUrl = "notes/" + id + ".md";
    fetch(mdUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("找不到檔案 notes/" + id + ".md");
        return res.text();
      })
      .then(function (text) {
        var parsed = parseFrontMatter(text);
        var meta = parsed.meta;
        var titleZh = meta.title_zh || meta.title || id;
        document.title = titleZh + "｜探究筆記";

        var rel = relatedLabel(meta.related);
        var tags = (Array.isArray(meta.tags) ? meta.tags : [])
          .map(function (t) {
            return '<a class="tag" href="index.html">' + escapeHtml(t) + "</a>";
          })
          .join("");

        var linkHtml = "";
        if (meta.doi) {
          linkHtml =
            '<a class="doi-link" href="https://doi.org/' +
            encodeURI(meta.doi) +
            '">doi:' +
            escapeHtml(meta.doi) +
            "</a>";
        } else if (meta.link) {
          linkHtml =
            '<a class="doi-link" href="' +
            escapeHtml(meta.link) +
            '">' +
            escapeHtml(meta.link) +
            "</a>";
        }

        var chips = [];
        if (meta.read_date) chips.push("閱讀日期 " + escapeHtml(meta.read_date));
        if (meta.status) chips.push(escapeHtml(meta.status));
        chips.push('<span class="' + relatedClass(rel.score) + '">' + escapeHtml(rel.text) + "</span>");

        if (typeof marked === "undefined" || !marked.parse) {
          throw new Error("Markdown 套件尚未載入");
        }
        var bodyHtml = marked.parse(parsed.body, { async: false });

        root.innerHTML =
          '<article class="note">' +
          '<header class="note-header">' +
          "<h1>" +
          escapeHtml(titleZh) +
          "</h1>" +
          (meta.title && meta.title_zh
            ? '<p class="title-en">' + escapeHtml(meta.title) + "</p>"
            : "") +
          '<p class="biblio">' +
          formatBiblio(meta) +
          "</p>" +
          (linkHtml ? "<p>" + linkHtml + "</p>" : "") +
          '<div class="meta-chips">' +
          chips.join('<span aria-hidden="true">·</span>') +
          "</div>" +
          '<div class="tags" style="margin-top:0.8rem">' +
          tags +
          "</div>" +
          "</header>" +
          '<div class="prose">' +
          bodyHtml +
          "</div>" +
          "</article>";
      })
      .catch(function (err) {
        root.innerHTML =
          '<div class="error"><p>無法載入這則筆記。</p><p class="muted">' +
          escapeHtml(err.message) +
          "</p><p>請確認是以本機伺服器開啟，並檢查 <code>id</code> 是否與檔名相符。</p>" +
          '<p><a href="index.html">回到全部筆記</a></p></div>';
      });
  }

  global.PaperNotes = {
    renderIndex: renderIndex,
    renderNote: renderNote
  };
})(window);
