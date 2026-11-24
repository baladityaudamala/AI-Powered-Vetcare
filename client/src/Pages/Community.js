import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PostCard from "../Components/Community/PostCard";
import AddPostModal from "../Components/Modals/AddPostModal";
import PetContext from "../Context/PetContext";
import UserContext from "../Context/UserContext";

const Community = () => {
    const { userData } = useContext(UserContext);
    const { pets, setPets } = useContext(PetContext);

    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [newCaption, setNewCaption] = useState("");
    const [selectedPet, setSelectedPet] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Dog");
    const [file, setFile] = useState(null);
    const [tags, setTags] = useState("");

    // Daily Bark Question
    const dailyQuestions = [
        "What is your pet's favorite sleeping spot?",
        "Does your pet have a funny habit? Share it!",
        "What is your pet's favorite treat?",
        "Show us your pet's best trick!",
        "Where does your pet love to go for a walk?"
    ];
    const [dailyBark] = useState(dailyQuestions[Math.floor(Math.random() * dailyQuestions.length)]);

    useEffect(() => {
        const loadPets = async () => {
            const userId = userData.user?.id || userData.user?._id;
            if (!userId) return;

            try {
                const { data } = await axios.get(`/api/getpetbyuser/${userId}`, {
                    headers: { "x-auth-token": localStorage.getItem("auth-token") }
                });
                setPets(data || []);
            } catch (err) {
                console.log(err);
            }
        };

        if (!pets?.length) loadPets();
    }, [userData.user, pets?.length, setPets]);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            let url = "/posts";
            if (filter !== "All") {
                url = `/posts/category/${filter}`;
            }

            const { data } = await axios.get(url, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") }
            });
            setPosts(data);
        } catch (err) {
            console.log(err);
            // toast.error("Failed to load feed");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPet) {
            toast.error("Please select which pet is posting!");
            return;
        }

        const pet = pets.find(p => String(p._id || p.id) === String(selectedPet));
        if (!pet) {
            toast.error("Selected pet could not be found.");
            return;
        }

        const formData = new FormData();
        formData.append("petName", pet.PetName);
        formData.append("ownerName", userData.user.displayName);
        formData.append("caption", newCaption);
        formData.append("category", selectedCategory);

        const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t !== "");
        formData.append("tags", JSON.stringify(tagsArray));

        if (file) {
            formData.append("file", file);
        }

        try {
            await axios.post("/posts", formData, {
                headers: {
                    "x-auth-token": localStorage.getItem("auth-token"),
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success("Post shared with the community!");
            setNewCaption("");
            setSelectedPet("");
            setSelectedCategory("Dog");
            setFile(null);
            setTags("");
            setShowPostModal(false);
            setFilter("All");
            if (filter === "All") loadPosts();
        } catch (err) {
            console.log(err);
            toast.error("Failed to create post");
        }
    };

    return (
        <div className="container mt-4 mb-5">
            {/* Daily Bark Pinned Post */}
            <div className="alert alert-warning text-center shadow-sm" role="alert" style={{ borderRadius: "20px", border: "2px solid #ffc107" }}>
                <h4 className="alert-heading"><i className="bi bi-megaphone-fill"></i> The Daily Bark</h4>
                <p className="mb-0" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{dailyBark}</p>
            </div>

            {/* Actions Bar */}
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4">
                {/* Filter Bar */}
                <div className="btn-group shadow-sm" role="group">
                    {["All", "Dog", "Cat", "Bird", "Other"].map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`btn ${filter === cat ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                {userData.user && (
                    <button
                        type="button"
                        className="btn btn-primary rounded-pill px-4 shadow-sm"
                        onClick={() => setShowPostModal(true)}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Post
                    </button>
                )}
            </div>

            <div className="row justify-content-center">
                {/* Right Column: Feed (Centered) */}
                <div className="col-lg-8 col-md-10">
                    {/* Posts List */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        posts.length > 0 ? (
                            posts.map(post => <PostCard key={post._id} post={post} refreshPosts={loadPosts} />)
                        ) : (
                            <div className="text-center text-muted py-5">
                                <h3>No posts yet. Be the first to bark! 🐶</h3>
                            </div>
                        )
                    )}
                </div>
            </div>

            <AddPostModal
                show={showPostModal}
                handleClose={() => setShowPostModal(false)}
                handleSubmit={handlePostSubmit}
                pets={pets || []}
                selectedPet={selectedPet}
                setSelectedPet={setSelectedPet}
                newCaption={newCaption}
                setNewCaption={setNewCaption}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                tags={tags}
                setTags={setTags}
                setFile={setFile}
            />
        </div>
    );
};

export default Community;
