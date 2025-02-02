import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Header from "../components/Nav";

const Post = () => {
  const [formData, setFormData] = useState({ heading: "", writeup: "" });
  const [college, setCollege] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserCollegeAndUsername = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCollege(userSnap.data().college);
          setUsername(userSnap.data().username);
        }
      }
    };

    fetchUserCollegeAndUsername();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleImageUpload = async () => {
    if (!image) return;
    setUploading(true);
    setError("");
  
    const formData = new FormData();
    formData.append("certificate", image); // The API expects the file under "certificate"
  
    try {
      const response = await fetch("https://trashtalk-lake.vercel.app//api/upload", { // Update this to match the correct route
        method: "POST",
        body: formData,
      });
  
      const data = await response.json(); // This line will throw if the response is not valid JSON
      if (response.ok) {
        setImageUrl(data.link);
        setSuccess("Image uploaded successfully!");
      } else {
        setError("Image upload failed.");
      }
    } catch (error) {
      setError("Error uploading image.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.heading || !formData.writeup) {
      setError("Please fill in all fields.");
      return;
    }

    if (!user) {
      setError("You must be logged in to post.");
      return;
    }

    if (!college) {
      setError("College information is missing.");
      return;
    }

    try {
      await addDoc(collection(db, college), {
        heading: formData.heading,
        writeup: formData.writeup,
        imageUrl: imageUrl || "", // Save image URL if available
        likes: [],
        likesnumber: 0,
        email: user.email,
        username: username,
        updatedAt: new Date().toLocaleDateString(),
      });

      setSuccess("Post created successfully!");
      setFormData({ heading: "", writeup: "" });
      setImage(null);
      setImageUrl("");

      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      console.error("Firestore Error:", err);
      setError("Error creating post. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-col items-center justify-center mt-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
            Create a New Post
          </h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="heading"
              type="text"
              placeholder="Enter a catchy heading..."
              value={formData.heading}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <textarea
              name="writeup"
              placeholder="Write your post here..."
              value={formData.writeup}
              onChange={handleChange}
              required
              className="w-full p-3 h-32 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* ✅ Image Upload Section */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {image && !imageUrl && (
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={uploading}
                className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
            )}

            {/* ✅ Display Uploaded Image Preview */}
            {imageUrl && (
              <div className="text-center">
                <p className="text-green-500">Image uploaded successfully!</p>
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="mt-2 w-full h-40 object-cover rounded-md"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Post;
