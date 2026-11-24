const router = require("express").Router();
const path = require("path");
const fs = require("fs");

module.exports = {
	saveLocImage: async (req, res, next) => {
		try {
			if (!req.file) {
				return res.status(400).json({ msg: "No image file was uploaded" });
			}

			const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || "";
			const imagePath = `/images/${req.file.filename}`;
			const fileUrl = baseUrl
				? `${baseUrl.replace(/\/+$/, "")}${imagePath}`
				: imagePath;

			return res.json({ fileUrl });
		} catch (err) {
			console.error("Image upload response error:", err);
			return res.status(500).json({ msg: "Failed to save image" });
		}
	},
	getLocImages: async (req, res) => {
		const uploadDirectory = path.join("client", "public", "images");

		fs.readdir(uploadDirectory, (err, files) => {
			if (err) {
				return res.json({ msg: err });
			}

			if (files.length === 0) {
				return res.json({ msg: "No Images Uploaded" });
			}

			return res.json({ files });
		});
	},
};
