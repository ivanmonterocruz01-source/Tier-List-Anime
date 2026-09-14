// ============================================================
// DEFINICIÓN DEL SISTEMA DE PUNTUACIÓN Y TIER
// ============================================================

const CATEGORIES = [
  { key: "historia",     label: "Historia",      desc: "Trama, ritmo, giros, final" },
  { key: "personajes",   label: "Personajes",    desc: "Desarrollo, carisma, secundarios" },
  { key: "animacion",    label: "Animación",     desc: "Fluidez, peleas, movimiento" },
  { key: "arte",         label: "Arte",          desc: "Diseño, escenarios, estilo visual" },
  { key: "originalidad", label: "Originalidad",  desc: "Ideas propias, aporte al género" },
  { key: "plus",         label: "Plus personal", desc: "BSO, emoción, nostalgia" },
];

// De arriba a abajo. "reqs" son los mínimos por categoría para
// poder quedarse en ese tier aunque la puntuación total alcance.
// Si no se cumplen, se baja al siguiente tier y se vuelve a comprobar.
const TIERS = [
  { name: "S", min: 27, max: 30, reqs: { historia: 4, personajes: 4, animacion: 4 } },
  { name: "A", min: 23, max: 26, reqs: { historia: 3, personajes: 3 } },
  { name: "B", min: 19, max: 22, reqs: {} },
  { name: "C", min: 15, max: 18, reqs: {} },
  { name: "D", min: 11, max: 14, reqs: {} },
  { name: "E", min: 6,  max: 10, reqs: {} },
  { name: "F", min: 0,  max: 5,  reqs: {} },
];

function computeTier(scores) {
  const total = CATEGORIES.reduce((sum, c) => sum + (scores[c.key] || 0), 0);
  let idx = TIERS.findIndex(t => total >= t.min && total <= t.max);
  if (idx === -1) idx = TIERS.length - 1;
  while (idx < TIERS.length) {
    const reqs = TIERS[idx].reqs;
    const meetsReqs = Object.entries(reqs).every(([k, v]) => (scores[k] || 0) >= v);
    if (meetsReqs) break;
    idx++;
  }
  return { total, tier: TIERS[idx].name };
}

// ============================================================
// ESTADO
// ============================================================

let currentUser = null;
let animeList = [];
let editingId = null;          // null = modo "añadir"
let currentScores = {};        // puntuaciones activas en el modal

// ============================================================
// AUTENTICACIÓN
// ============================================================

async function initAuth() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return;
  }
  currentUser = data.session.user;
  document.getElementById("userEmail").textContent = currentUser.email;

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (!session) window.location.href = "login.html";
  });

  await loadAnimes();
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

// ============================================================
// CARGA Y RENDER DE LA LISTA
// ============================================================

async function loadAnimes() {
  const { data, error } = await supabaseClient
    .from("animes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    alert("No se pudo cargar tu lista: " + error.message);
    return;
  }
  animeList = data || [];
  renderTierList();
}

function renderTierList() {
  const container = document.getElementById("tierContainer");
  const emptyState = document.getElementById("emptyState");
  container.innerHTML = "";

  if (animeList.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  const grouped = {};
  TIERS.forEach(t => grouped[t.name] = []);

  animeList.forEach(anime => {
    const { total, tier } = computeTier(anime);
    grouped[tier].push({ ...anime, _total: total });
  });

   TIERS.forEach(t => grouped[t.name].sort((a, b) => b._total - a._total));

  TIERS.forEach(t => {
    const row = document.createElement("div");
    row.className = `tier-row tier-${t.name.toLowerCase()}`;

    const chip = document.createElement("div");
    chip.className = "tier-chip";
    chip.textContent = t.name;
    row.appendChild(chip);

    const cardsWrap = document.createElement("div");
    cardsWrap.className = "tier-cards";

    const items = grouped[t.name];
    if (items.length === 0) {
      cardsWrap.classList.add("empty");
      cardsWrap.textContent = "Vacío";
    } else {
      items.forEach(anime => cardsWrap.appendChild(buildCard(anime)));
    }

    row.appendChild(cardsWrap);
    container.appendChild(row);
  });
}

function buildCard(anime) {
  const card = document.createElement("div");
  card.className = "anime-card";
  card.addEventListener("click", () => openModal(anime));

  const img = document.createElement("img");
  img.className = "anime-cover";
  img.loading = "lazy";
  img.src = anime.cover_url || "";
  img.alt = anime.title;
  img.onerror = () => { img.style.display = "none"; };
  card.appendChild(img);

  const info = document.createElement("div");
  info.className = "anime-info";
  info.innerHTML = `
    <div class="anime-title">${escapeHtml(anime.title)}</div>
    <div class="anime-score">${anime._total} / 30</div>
  `;
  card.appendChild(info);

  return card;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// MODAL: AÑADIR / EDITAR
// ============================================================

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const titleInput = document.getElementById("titleInput");
const coverInput = document.getElementById("coverInput");
const coverPreview = document.getElementById("coverPreview");
const categoriesWrap = document.getElementById("categoriesWrap");
const scoreTotal = document.getElementById("scoreTotal");
const scoreTierBadge = document.getElementById("scoreTierBadge");
const deleteBtn = document.getElementById("deleteBtn");

function buildCategoryRows() {
  categoriesWrap.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `
      <div class="category-label">${cat.label}<small>${cat.desc}</small></div>
      <div class="stars" data-key="${cat.key}"></div>
    `;
    categoriesWrap.appendChild(row);

    const starsWrap = row.querySelector(".stars");
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "star-btn";
      btn.textContent = "★";
      btn.dataset.value = i;
      btn.addEventListener("click", () => {
        // click en la misma estrella máxima actual -> resetea a 0
        currentScores[cat.key] = (currentScores[cat.key] === i) ? 0 : i;
        renderStars(starsWrap, cat.key);
        updateScoreSummary();
      });
      starsWrap.appendChild(btn);
    }
  });
}

function renderStars(starsWrap, key) {
  const value = currentScores[key] || 0;
  starsWrap.querySelectorAll(".star-btn").forEach(btn => {
    btn.classList.toggle("filled", Number(btn.dataset.value) <= value);
  });
}

function renderAllStars() {
  categoriesWrap.querySelectorAll(".stars").forEach(wrap => {
    renderStars(wrap, wrap.dataset.key);
  });
}

function updateScoreSummary() {
  const { total, tier } = computeTier(currentScores);
  scoreTotal.textContent = `${total} / 30`;
  scoreTierBadge.textContent = tier;
  scoreTierBadge.style.background = `var(--tier-${tier.toLowerCase()})`;
}

function openModal(anime) {
  editingId = anime ? anime.id : null;
  modalTitle.textContent = editingId ? "Editar anime" : "Añadir anime";
  deleteBtn.style.display = editingId ? "inline-flex" : "none";

  titleInput.value = anime ? anime.title : "";
  coverInput.value = anime ? (anime.cover_url || "") : "";
  updateCoverPreview();

  currentScores = {};
  CATEGORIES.forEach(c => currentScores[c.key] = anime ? (anime[c.key] || 0) : 0);

  buildCategoryRows();
  renderAllStars();
  updateScoreSummary();

  modalBackdrop.classList.add("show");
}

function closeModal() {
  modalBackdrop.classList.remove("show");
  editingId = null;
}

document.getElementById("addBtn").addEventListener("click", () => openModal(null));
document.getElementById("modalClose").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

coverInput.addEventListener("input", updateCoverPreview);
function updateCoverPreview() {
  const url = coverInput.value.trim();
  if (url) {
    coverPreview.innerHTML = `<img src="${url}" onerror="this.parentElement.textContent='No se pudo cargar la imagen'">`;
  } else {
    coverPreview.textContent = "Sin portada";
  }
}

// ============================================================
// GUARDAR / ELIMINAR
// ============================================================

document.getElementById("animeForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Guardando...";

  const payload = {
    title: titleInput.value.trim(),
    cover_url: coverInput.value.trim() || null,
    ...currentScores,
  };

  let error;
  if (editingId) {
    ({ error } = await supabaseClient.from("animes").update(payload).eq("id", editingId));
  } else {
    payload.user_id = currentUser.id;
    ({ error } = await supabaseClient.from("animes").insert(payload));
  }

  saveBtn.disabled = false;
  saveBtn.textContent = "Guardar";

  if (error) {
    alert("No se pudo guardar: " + error.message);
    return;
  }

  closeModal();
  await loadAnimes();
});

deleteBtn.addEventListener("click", async () => {
  if (!editingId) return;
  if (!confirm("¿Eliminar este anime de tu tier list?")) return;

  const { error } = await supabaseClient.from("animes").delete().eq("id", editingId);
  if (error) {
    alert("No se pudo eliminar: " + error.message);
    return;
  }
  closeModal();
  await loadAnimes();
});

// ============================================================
// ARRANQUE
// ============================================================

initAuth();