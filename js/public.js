// ===============================
// CONFIG
// ===============================
const CLOUD_NAME = "dv8goucns";
const GIST_ID = "66b57f0909fc1ec6ccae418c10ec5515";

// ===============================
// HELPERS
// ===============================
function qs(id) {
  return document.getElementById(id);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ===============================
// LOAD MANIFEST FROM GIST
// ===============================
async function loadManifest() {
  const res = await fetch("./manifest.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load manifest");
  return res.json();
}

// ===============================
// INDEX PAGE – FOLDER CARDS
// ===============================
async function renderFolders() {
  const container = qs("folders");
  if (!container) return;

  try {
    const manifest = await loadManifest();
    const folders = manifest.folders || {};

    if (!Object.keys(folders).length) {
      container.textContent = "No galleries yet.";
      return;
    }

    Object.entries(folders).forEach(([slug, folder]) => {
      const images = folder.images || [];
      const coverId = images.length
        ? images[Math.floor(Math.random() * images.length)]
        : null;

      const coverUrl = coverId
        ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_500,h_500,c_fill/${coverId}`
        : "";

      const card = document.createElement("a");
      card.href = `gallery.html?f=${slug}`;
      card.className = "folder-card";

      if (coverUrl) {
        card.style.backgroundImage = `url(${coverUrl})`;
      }

      const title = document.createElement("div");
      title.className = "folder-title";
      title.textContent = folder.name;

      card.appendChild(title);
      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.textContent = "Failed to load galleries.";
  }
}


// ===============================
// GALLERY PAGE – IMAGE GRID
// ===============================
async function renderGallery() {
  const container = qs("photos");

  if (!container) return;
    container.innerHTML = "";

  const slug = getParam("f");
  if (!slug) {
    container.textContent = "Gallery not found.";
    return;
  }

  try {
    const manifest = await loadManifest();
    const folder = manifest.folders?.[slug];

    if (!folder) {
      container.textContent = "Gallery not found.";
      return;
    }

    folder.images.forEach(publicId => {
      const img = document.createElement("img");
      img.src =
        `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
      img.loading = "lazy";
      img.style.width = "100%";
      img.style.display = "block";

      // Tap → fullscreen → save
      img.onclick = () => window.open(img.src, "_blank");

      container.appendChild(img);
    });

  } catch (err) {
    console.error(err);
    container.textContent = "Failed to load images.";
  }
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  renderFolders();
  renderGallery();
});
