// ===============================
// CONFIG
// ===============================
const CLOUD_NAME = "dv8goucns";
const UPLOAD_PRESET = "UploadPreset";
const MANIFEST_PATH = "./manifest.json";

// ===============================
// MAIN UPLOAD FUNCTION
// ===============================
async function uploadImages() {
  const folderInput = document.getElementById("folderName");
  const fileInput = document.getElementById("fileInput");
  const status = document.getElementById("status");

  const folderName = folderInput.value.trim();
  const files = fileInput.files;

  if (!folderName || !files.length) {
    alert("Missing folder name or files");
    return;
  }

  const slug = folderName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  status.textContent = "Loading manifest…";

  // ===============================
  // 1️⃣ LOAD LOCAL MANIFEST
  // ===============================
  let manifest;

  try {
    const res = await fetch(MANIFEST_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error();
    manifest = await res.json();
  } catch {
    alert("Failed to load manifest.json");
    return;
  }

  if (!manifest.folders) {
    manifest.folders = {};
  }

  if (!manifest.folders[slug]) {
    manifest.folders[slug] = {
      name: folderName,
      images: []
    };
  }

  // ===============================
  // 2️⃣ UPLOAD IMAGES TO CLOUDINARY
  // ===============================
  let count = 0;

  for (const file of files) {
    status.textContent = `Uploading ${++count} / ${files.length}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", slug);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    if (!uploadRes.ok) {
      alert("Image upload failed");
      return;
    }

    const data = await uploadRes.json();
    manifest.folders[slug].images.push(data.public_id);
  }

  // ===============================
  // 3️⃣ DOWNLOAD UPDATED MANIFEST
  // ===============================
  status.textContent = "Downloading updated manifest…";

  const blob = new Blob(
    [JSON.stringify(manifest, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "manifest.json";
  a.click();

  URL.revokeObjectURL(url);

  status.textContent = "✅ Upload complete — commit the new manifest.json";
}