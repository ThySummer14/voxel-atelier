(function () {
  const works = Array.isArray(window.WORKS) ? window.WORKS : [];
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const catFilters = document.getElementById("catFilters");
  const modelFilters = document.getElementById("modelFilters");
  const filterCount = document.getElementById("filterCount");
  if (!grid || !catFilters || !modelFilters) return;

  const state = { type: "all", value: "" };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (value) => String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const categoryOrder = ["山水", "建筑", "机械", "奇想", "静帧"];
  const categories = [...new Set(works.map((w) => w.cat))]
    .sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
  const models = [...new Set(works.map((w) => w.model).filter(Boolean))]
    .sort((a, b) => {
      const count = (name) => works.filter((w) => w.model === name).length;
      return count(b) - count(a) || a.localeCompare(b, "zh-Hans-CN");
    });
  const unknownCount = works.filter((w) => !w.model).length;

  function chip(label, count, type, value) {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "chip";
    node.dataset.type = type;
    node.dataset.value = value;
    node.setAttribute("aria-pressed", "false");
    node.innerHTML = esc(label) + (count != null ? `<span class="count">${count}</span>` : "");
    node.addEventListener("click", () => {
      if (type === "all") {
        state.type = "all";
        state.value = "";
      } else if (state.type === type && state.value === value) {
        state.type = "all";
        state.value = "";
      } else {
        state.type = type;
        state.value = value;
      }
      sync();
      render();
    });
    return node;
  }

  catFilters.appendChild(chip("全部", works.length, "all", ""));
  categories.forEach((cat) => {
    catFilters.appendChild(chip(cat, works.filter((w) => w.cat === cat).length, "cat", cat));
  });
  models.forEach((model) => {
    modelFilters.appendChild(chip(model, works.filter((w) => w.model === model).length, "model", model));
  });
  if (unknownCount) modelFilters.appendChild(chip("未标注", unknownCount, "model", "未标注"));

  function sync() {
    document.querySelectorAll(".chip").forEach((node) => {
      const active = state.type === "all"
        ? node.dataset.type === "all"
        : node.dataset.type === state.type && node.dataset.value === state.value;
      node.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function filteredWorks() {
    if (state.type === "all") return works.slice();
    if (state.type === "cat") return works.filter((w) => w.cat === state.value);
    if (state.type === "model") return works.filter((w) => (w.model || "未标注") === state.value);
    return works.slice();
  }

  function cardHTML(work, filteredIndex) {
    const index = works.indexOf(work) + 1;
    const no = String(index).padStart(2, "0");
    const model = work.model || "模型未标注";
    const still = work.cat === "静帧";
    const eager = filteredIndex < 2;
    return `
      <article class="card-wrap" data-reveal style="--i:${Math.min(filteredIndex, 12)}">
        <a class="card" href="./${esc(work.slug)}/" target="_blank" rel="noopener" style="--accent:${esc(work.accent || "#a83a2c")}" aria-label="进入作品：${esc(work.title)}">
          <div class="card-media">
            <img src="./assets/covers/${esc(work.slug)}@800.jpg"
                 srcset="./assets/covers/${esc(work.slug)}@800.jpg 800w, ./assets/covers/${esc(work.slug)}.jpg 1600w"
                 sizes="(max-width:900px) 100vw, 46vw"
                 width="1600" height="1000"
                 alt="${esc(work.title)} · ${esc(work.en)}"
                 loading="${eager ? "eager" : "lazy"}"
                 ${eager ? 'fetchpriority="high"' : ""}
                 decoding="async">
            <span class="card-kind${still ? " still" : ""}">${still ? "静帧" : "实时"}</span>
            <span class="card-arrow" aria-hidden="true">↗</span>
          </div>
          <div class="card-body">
            <div class="card-top">
              <span class="card-index">NO. ${no}</span>
              <span class="card-cat">${esc(work.cat)}</span>
            </div>
            <h3>${esc(work.title)}<span>${esc(work.en)}</span></h3>
            <p>${esc(work.desc)}</p>
            <div class="card-meta">
              <span class="card-model${work.model ? "" : " unknown"}">${esc(model)}</span>
              <span class="card-date">${esc(work.date)}</span>
            </div>
          </div>
        </a>
      </article>`;
  }

  let observer = null;
  if ("IntersectionObserver" in window && !reduced) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
  }

  function render() {
    const list = filteredWorks();
    grid.innerHTML = list.map(cardHTML).join("");
    if (empty) empty.classList.toggle("show", list.length === 0);
    if (filterCount) filterCount.textContent = `${list.length} / ${works.length}`;
    grid.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        const media = img.closest(".card-media");
        if (media) media.classList.add("is-missing");
      });
    });
    if (observer) {
      grid.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));
    } else {
      grid.querySelectorAll("[data-reveal]").forEach((node) => node.classList.add("is-in"));
    }
    writeHash();
  }

  function writeHash() {
    const hash = state.type === "all" ? "" : `#${state.type}=${encodeURIComponent(state.value)}`;
    try {
      history.replaceState(null, "", window.location.pathname + window.location.search + hash);
    } catch (e) {}
  }

  function readHash() {
    const match = window.location.hash.match(/^#(cat|model)=(.+)$/);
    if (!match) return;
    let value = "";
    try { value = decodeURIComponent(match[2]); } catch (e) { return; }
    if (match[1] === "cat" && categories.includes(value)) {
      state.type = "cat";
      state.value = value;
    } else if (match[1] === "model") {
      const known = models.includes(value) || (value === "未标注" && unknownCount > 0);
      if (known) {
        state.type = "model";
        state.value = value;
      }
    }
  }

  const statWorks = document.getElementById("stat-works");
  const statModels = document.getElementById("stat-models");
  const navCount = document.getElementById("nav-count");
  const workCount = document.getElementById("work-count");
  if (statWorks) statWorks.textContent = works.length;
  if (statModels) statModels.textContent = models.length;
  if (navCount) navCount.textContent = works.length;
  if (workCount) workCount.textContent = works.length;

  const dates = works.map((w) => w.date).filter(Boolean).sort();
  const range = document.getElementById("stat-range");
  if (range && dates.length) {
    const first = dates[0], last = dates[dates.length - 1];
    range.textContent = first.slice(0, 4) === last.slice(0, 4)
      ? `${first}—${last.slice(5)}`
      : `${first}—${last}`;
  }

  readHash();
  sync();
  render();
})();
