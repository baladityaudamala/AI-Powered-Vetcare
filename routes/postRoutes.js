const router = require("express").Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const {
    createPost,
    getAllPosts,
    getPostsByCategory,
    getPostMedia,
    likePost,
    deletePost,
    addComment,
    repost,
    getPostsByUser,
} = require("../controllers/PostController");

const allowedMediaTypes = new Set([
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/ogg",
    "video/webm",
]);
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!allowedMediaTypes.has(file.mimetype)) {
            return callback(new Error("Choose a JPEG, PNG, GIF, WebP, AVIF, MP4, OGG, or WebM file."));
        }
        callback(null, true);
    },
});

router.post("/", auth, (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            return res.status(status).json({ msg: err.message });
        }
        next();
    });
}, createPost);
router.get("/", auth, getAllPosts);
router.get("/category/:cat", auth, getPostsByCategory);
router.get("/media/:id", getPostMedia);
router.put("/like/:id", auth, likePost);
router.delete("/:id", auth, deletePost);
router.post("/comment/:id", auth, addComment);
router.post("/repost/:id", auth, repost);
router.get("/user/:id", auth, getPostsByUser);

module.exports = router;
