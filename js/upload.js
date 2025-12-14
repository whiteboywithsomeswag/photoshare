// ===============================
// CONFIG
// ===============================
const CLOUD_NAME = "dv8goucns";
const UPLOAD_PRESET = "UploadPreset";

const GIST_ID = "66b57f0909fc1ec6ccae418c10ec5515";
const GITHUB_TOKEN = "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"; // keep secret

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
  // 1️⃣ LOAD MANIFEST FROM GIST
  // ===============================
  const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`);
  if (!gistRes.ok) {
    alert("Failed to load gist");
    return;
  }

  const gist = await gistRes.json();
  const manifest = JSON.parse(
    gist.files["manifest.json"].content
  );

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
      { method: "POST", body: formData }
    );

    if (!uploadRes.ok) {
      alert("Image upload failed");
      return;
    }

    const data = await uploadRes.json();

    // ✅ store public_id
    manifest.folders[slug].images.push(data.public_id);
  }

  // ===============================
  // 3️⃣ SAVE MANIFEST BACK TO GIST
  // ===============================
  status.textContent = "Saving manifest…";

  const saveRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      files: {
        "manifest.json": {
          content: JSON.stringify(manifest, null, 2)
        }
      }
    })
  });

  if (!saveRes.ok) {
    alert("Failed to save manifest");
    return;
  }

  status.textContent = "✅ Upload complete";
}
