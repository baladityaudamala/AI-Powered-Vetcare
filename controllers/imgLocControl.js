const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const { PetImage } = require("../models/index");

module.exports = {
	saveLocImage: async (req, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({ msg: "No image file was uploaded" });
			}

			const image = await PetImage.create({
				userId: req.user,
				mimeType: req.file.mimetype,
				imageData: req.file.buffer,
			});

			const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || "";
			const imagePath = `/api/images/${image.id}`;
			const fileUrl = baseUrl ? `${baseUrl.replace(/\/+$/, "")}${imagePath}` : imagePath;

			return res.status(201).json({ fileUrl });
		} catch (err) {
			console.error("Pet image save error:", err);
			return res.status(500).json({ msg: "Failed to store pet image" });
		}
	},
	getPetImage: async (req, res) => {
		try {
			const image = await PetImage.findByPk(req.params.id, {
				attributes: ["mimeType", "imageData"],
			});
			if (!image) return res.status(404).json({ msg: "Image not found" });

			res.set("Content-Type", image.mimeType);
			res.set("Cache-Control", "public, max-age=86400");
			res.set("X-Content-Type-Options", "nosniff");
			return res.send(image.imageData);
		} catch (err) {
			console.error("Pet image fetch error:", err);
			return res.status(500).json({ msg: "Failed to fetch pet image" });
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
