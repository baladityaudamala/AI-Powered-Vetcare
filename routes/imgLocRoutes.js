const router = require("express").Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const { getLocImages, getPetImage, saveLocImage } = require("../controllers/imgLocControl");

const allowedImageTypes = new Set([
	"image/avif",
	"image/gif",
	"image/jpeg",
	"image/png",
	"image/webp",
]);
const uploadImage = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 8 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (!allowedImageTypes.has(file.mimetype)) {
			return callback(new Error("Upload a JPEG, PNG, GIF, WebP, or AVIF image."));
		}
		callback(null, true);
	},
}).single("file");

router.get("/getLocImages", auth, getLocImages);
router.get("/images/:id", getPetImage);
router.post("/saveLocImage", auth, (req, res, next) => {
	uploadImage(req, res, (error) => {
		if (error) {
			const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
			return res.status(status).json({ msg: error.message });
		}
		saveLocImage(req, res);
	});
});

module.exports = router;
