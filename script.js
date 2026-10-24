// =====================================
// PIXORA — PHOTOCARD CREATOR
// =====================================

const photoUpload = document.getElementById("photoUpload");
const cardPhoto = document.getElementById("cardPhoto");
const photoPlaceholder = document.getElementById("photoPlaceholder");

const cardName = document.getElementById("cardName");
const cardText = document.getElementById("cardText");

const previewName = document.getElementById("previewName");
const previewText = document.getElementById("previewText");

const cardTheme = document.getElementById("cardTheme");
const photocard = document.getElementById("photocard");
const downloadButton = document.getElementById("downloadButton");

let uploadedImage = null;
let currentObjectURL = null;

// =====================================
// 1. UPLOAD A PHOTO
// =====================================

photoUpload.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        this.value = "";
        return;
    }

    // Limit uploads to 15 MB.
    if (file.size > 15 * 1024 * 1024) {
        alert("Please choose an image smaller than 15 MB.");
        this.value = "";
        return;
    }

    const image = new Image();
    const objectURL = URL.createObjectURL(file);

    image.onload = function () {
        if (currentObjectURL) {
            URL.revokeObjectURL(currentObjectURL);
        }

        currentObjectURL = objectURL;
        uploadedImage = image;

        cardPhoto.replaceChildren();
        image.alt = "Your uploaded photocard image";
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "cover";

        cardPhoto.appendChild(image);
        URL.revokeObjectURL(objectURL);

        currentObjectURL = null;
    };

    image.onerror = function () {
        URL.revokeObjectURL(objectURL);
        alert("We couldn't open that image. Please try another one.");
        this.src = "";
    };

    image.src = objectURL;
});

// =====================================
// 2. UPDATE THE CAPTION LIVE
// =====================================

cardName.addEventListener("input", function () {
    previewName.textContent =
        this.value.trim() || "YOUR LITTLE UNIVERSE ♡";
});

cardText.addEventListener("input", function () {
    previewText.textContent =
        this.value.trim() || "A moment, made magical.";
});

// =====================================
// 3. CHANGE THE PHOTOCARD THEME
// =====================================

function changeTheme(theme) {
    const allowedThemes = [
        "galaxy",
        "coquette",
        "dark",
        "pastel",
        "rainbow"
    ];

    if (!allowedThemes.includes(theme)) return;

    photocard.classList.remove(...allowedThemes);
    photocard.classList.add(theme);

    cardTheme.value = theme;
}

cardTheme.addEventListener("change", function () {
    changeTheme(this.value);
});

// Allow users to click the theme cards to select a design.
document.querySelectorAll(".template-card").forEach(function (button) {
    button.addEventListener("click", function () {
        changeTheme(this.dataset.theme);

        document.getElementById("studio").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

// =====================================
// 4. DOWNLOAD THE PHOTOCARD AS A PNG
// =====================================

downloadButton.addEventListener("click", async function () {
    if (!uploadedImage) {
        alert("Upload a photo first to create your photocard! 💜");
        photoUpload.click();
        return;
    }

    const originalText = downloadButton.textContent;

    downloadButton.disabled = true;
    downloadButton.textContent = "Creating your photocard...";

    try {
        const canvas = document.createElement("canvas");

        // High-resolution 2:3 photocard.
        canvas.width = 800;
        canvas.height = 1200;

        const ctx = canvas.getContext("2d");

        const theme = cardTheme.value;

        const palettes = {
            galaxy: {
                background: ["#342450", "#151022"],
                accent: "#c3a5ff",
                text: "#e6d9ff"
            },
            coquette: {
                background: ["#60334f", "#281522"],
                accent: "#f3b5d6",
                text: "#ffe2f1"
            },
            dark: {
                background: ["#303039", "#111116"],
                accent: "#ded9e8",
                text: "#f5f1ff"
            },
            pastel: {
                background: ["#49365c", "#251e38"],
                accent: "#f0c8ff",
                text: "#f8eaff"
            },
            rainbow: {
                background: ["#64346c", "#293c68"],
                accent: "#ffe1a8",
                text: "#fff0cf"
            }
        };

        const palette = palettes[theme] || palettes.galaxy;

        // Draw the background.
        const gradient = ctx.createLinearGradient(
            0, 0, canvas.width, canvas.height
        );

        gradient.addColorStop(0, palette.background[0]);
        gradient.addColorStop(1, palette.background[1]);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rounded rectangle path.
        function roundedRectPath(x, y, width, height, radius) {
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, radius);
        }

        // Draw the outer photocard border.
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 12;

        roundedRectPath(20, 20, 760, 1160, 32);
        ctx.stroke();

        // Draw decorative stars.
        ctx.fillStyle = palette.accent;
        ctx.textAlign = "center";
        ctx.font = "42px sans-serif";
        ctx.fillText("✦  ✧  ✦  ✧  ✦", 400, 90);

        // Draw the uploaded photo, preserving its proportions.
        const photoX = 80;
        const photoY = 130;
        const photoWidth = 640;
        const photoHeight = 780;

        const imageRatio = uploadedImage.width / uploadedImage.height;
        const boxRatio = photoWidth / photoHeight;

        let sx = 0;
        let sy = 0;
        let sw = uploadedImage.width;
        let sh = uploadedImage.height;

        if (imageRatio > boxRatio) {
            sw = uploadedImage.height * boxRatio;
            sx = (uploadedImage.width - sw) / 2;
        } else {
            sh = uploadedImage.width / boxRatio;
            sy = (uploadedImage.height - sh) / 2;
        }

        ctx.save();

        roundedRectPath(photoX, photoY, photoWidth, photoHeight, 18);
        ctx.clip();

        ctx.drawImage(
            uploadedImage,
            sx, sy, sw, sh,
            photoX, photoY, photoWidth, photoHeight
        );

        ctx.restore();

        // Draw the caption.
        const title = cardName.value.trim() || "YOUR LITTLE UNIVERSE ♡";
        const subtitle = cardText.value.trim() || "A moment, made magical.";

        ctx.textAlign = "center";
        ctx.fillStyle = palette.accent;
        ctx.font = "bold 32px sans-serif";

        function wrapText(text, maxWidth, lineHeight, startY) {
            const words = text.split(/\s+/);
            let line = "";
            let y = startY;

            for (const word of words) {
                const testLine = line ? line + " " + word : word;

                if (ctx.measureText(testLine).width > maxWidth && line) {
                    ctx.fillText(line, 400, y);
                    line = word;
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }

            if (line && y <= 1090) {
                ctx.fillText(line, 400, y);
            }

            return y + lineHeight;
        }

        const titleEnd = wrapText(title, 650, 40, 980);

        ctx.fillStyle = palette.text;
        ctx.font = "25px sans-serif";

        wrapText(
            subtitle,
            640,
            35,
            Math.min(titleEnd + 10, 1090)
        );

        // Bottom decoration.
        ctx.fillStyle = palette.accent;
        ctx.font = "36px sans-serif";
        ctx.fillText("☾  ✦  ♡  ✦  ☽", 400, 1145);

        // Export and download.
        const blob = await new Promise(function (resolve, reject) {
            canvas.toBlob(function (result) {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error("Could not create the PNG."));
                }
            }, "image/png");
        });

        const downloadURL = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = downloadURL;
        link.download = "pixora-photocard.png";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(function () {
            URL.revokeObjectURL(downloadURL);
        }, 1000);

    } catch (error) {
        console.error("Photocard export failed:", error);
        alert("Something went wrong while creating your photocard. Please try again.");
    } finally {
        downloadButton.disabled = false;
        downloadButton.textContent = originalText;
    }
});

// =====================================
// 5. INITIALIZE PIXORA
// =====================================

changeTheme("galaxy");

console.log("Pixora studio is ready! ✨");
