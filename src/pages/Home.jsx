import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Header from "../components/Nav";
import WriteupCard from "../components/Cards";
import { onAuthStateChanged } from "firebase/auth"; 

const Home = () => {
  const [writeups, setWriteups] = useState([]);
  const [college, setCollege] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [userData, setUserData] = useState(null); // Store logged-in user's data
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserCollege = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) { 
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userCollege = userSnap.data().college;
            setCollege(userCollege);
            setUserData(userSnap.data()); // Store user data
            fetchWriteups(userCollege);
          }
        }
      });

      return () => unsubscribe();
    };

    const fetchWriteups = async (collegeName) => {
      if (!collegeName) return;
      const writeupsRef = collection(db, collegeName);
      const querySnapshot = await getDocs(writeupsRef);
      const writeupsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setWriteups(writeupsList);
    };

    fetchUserCollege();
  }, []);

  const handleLike = async (postId, likes) => {
    if (!user) return;
    const postRef = doc(db, college, postId);
    const hasLiked = likes.includes(user.email);

    try {
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(user.email) : arrayUnion(user.email),
        likesnumber: increment(hasLiked ? -1 : 1),
      });

      setWriteups(prevWriteups =>
        prevWriteups.map(writeup =>
          writeup.id === postId
            ? {
                ...writeup,
                likes: hasLiked
                  ? writeup.likes.filter(email => email !== user.email)
                  : [...writeup.likes, user.email],
                likesnumber: hasLiked ? writeup.likesnumber - 1 : writeup.likesnumber + 1,
              }
            : writeup
        )
      );
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  const handleComment = async (postId) => {
    if (!user || !commentText.trim() || !userData) return;

    const postRef = doc(db, college, postId);
    const newComment = {
      user: userData.username, // Show username instead of email
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    try {
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });

      setWriteups(prevWriteups =>
        prevWriteups.map(writeup =>
          writeup.id === postId
            ? { ...writeup, comments: [...(writeup.comments || []), newComment] }
            : writeup
        )
      );

      setCommentText("");
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col items-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {writeups.map((writeup) => (
            <WriteupCard
              key={writeup.id}
              writeup={writeup}
              user={user}
              handleLike={handleLike}
              handleComment={handleComment}
              setCommentText={setCommentText}
              commentText={commentText}
              setSelectedPost={setSelectedPost}
            />
          ))}
        </div>

        {/* 🔹 Pop-up for Full Post View */}
        {selectedPost && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h3 className="text-lg font-bold">{selectedPost.heading}</h3>
      <p className="text-gray-700 mt-2">{selectedPost.writeup}</p>

      {/* 🔹 Image Display */}
      {console.log(selectedPost.imageUrl)}      
      <a 
  href={selectedPost.imageUrl} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-blue-500 underline mt-2 block"
>
  View Image
</a>

      {/* 🔹 Comments Section */}
      <div className="mt-4">
        <h4 className="text-md font-semibold">Comments</h4>
        <div className="max-h-40 overflow-y-auto mt-2">
          {selectedPost.comments && selectedPost.comments.length > 0 ? (
            selectedPost.comments.map((comment, index) => (
              <p key={index} className="bg-gray-200 p-2 rounded my-1 text-sm">
                <strong>{comment.user}:</strong> {comment.text} <br />
                <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
              </p>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
        </div>

        {/* Comment Input */}
        <div className="mt-2 flex">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 p-2 border rounded-l"
          />
          <button
            onClick={() => handleComment(selectedPost.id)}
            className="px-4 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      </div>

      <button onClick={() => setSelectedPost(null)} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
        Close
      </button>
    </div>
  </div>
)}

      </main>
    </div>
  );
};

export default Home;
