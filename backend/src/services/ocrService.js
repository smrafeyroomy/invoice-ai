const Tesseract = require("tesseract.js");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const runOCR = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let imagePath = filePath;

  // If PDF → convert to image
  if (ext === ".pdf") {
    const outputImage = filePath.replace(".pdf", ".png");

    await new Promise((resolve, reject) => {
      exec(
        `pdftoppm "${filePath}" "${outputImage.replace(".png", "")}" -png`,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    imagePath = outputImage.replace(".png", "-1.png");
  }

  const result = await Tesseract.recognize(imagePath, "eng");

  return result.data.text;
};

module.exports = { runOCR };
