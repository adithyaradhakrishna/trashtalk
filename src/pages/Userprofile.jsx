import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import WriteupCard from "../components/Cards";
import Header from "../components/Nav";
const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null); // 🔹 Pop-up state

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUser(userData);

          // Fetch posts from the user's college collection
          const postsRef = collection(db, userData.college);
          const postsQuery = query(postsRef, where("username", "==", username));
          const postsSnapshot = await getDocs(postsQuery);

          const userPosts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(userPosts);
        } else {
          setUser(null);
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [username]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (!user) return <p className="text-center text-lg text-red-500">User not found</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header /> {/* Navbar */}
      <div className="max-w-4xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900">Profile</h1>

        {/* User Details */}
        <div className="text-center mt-4">
          <p className="text-2xl font-semibold text-gray-800">
            <strong>Username:</strong> {user.username}
          </p>
          <p className="text-xl text-gray-700 mt-2">
            <strong>College:</strong> {user.college}
          </p>
        </div>

        {/* Posts Section */}
        <h2 className="text-2xl font-semibold mt-8 text-gray-900 text-center">Posts by {user.username}</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {posts.map((post) => (
              <WriteupCard key={post.id} writeup={post} setSelectedPost={setSelectedPost} />
            ))}
          </div>
        )}

        {/* 🔹 Pop-up Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <h3 className="text-lg font-bold">{selectedPost.heading}</h3>
              <p className="text-gray-700 mt-2">{selectedPost.writeup}</p>
              <button 
                onClick={() => setSelectedPost(null)} 
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
