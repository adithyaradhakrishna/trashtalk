import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom"; // Import Link & useNavigate
import Header from "../components/Nav";

const Chatroom = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [usernames, setUsernames] = useState({});
  const [college, setCollege] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setCollege(userSnap.data().college || "Global Chatroom"); // Default name if college is not set
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !college) return;

    const chatroomCollection = `${college}chatroom`;
    const q = query(collection(db, chatroomCollection), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);

      // Fetch usernames only for new senders
      const uniqueSenders = [...new Set(messagesData.map((msg) => msg.sender))].filter(
        (sender) => !usernames[sender]
      );

      if (uniqueSenders.length > 0) {
        const userDocs = await Promise.all(
          uniqueSenders.map(async (sender) => {
            const userRef = doc(db, "users", sender);
            const userSnap = await getDoc(userRef);
            return { sender, username: userSnap.exists() ? userSnap.data().username : "Unknown" };
          })
        );

        setUsernames((prevUsernames) =>
          userDocs.reduce((acc, { sender, username }) => ({ ...acc, [sender]: username }), prevUsernames)
        );
      }
    });

    return () => unsubscribe();
  }, [user, college, usernames]);

  const sendMessage = async () => {
    if (!user || !message.trim() || !college) return;

    const chatroomCollection = `${college}chatroom`;

    await addDoc(collection(db, chatroomCollection), {
      text: message,
      sender: user.uid,
      timestamp: new Date(),
    });

    setMessage("");
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  if (!user) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ✅ NavBar */}
      <Header />


      {/* ✅ Chat Container */}
      <div className="flex flex-col flex-grow max-w-3xl mx-auto w-full p-4">
        {/* ✅ Messages List */}
        <div className="bg-white shadow-md p-4 h-[400px] overflow-y-auto rounded-md">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="mb-3 p-2 border-b border-gray-200">
                <strong>
                  <Link to={`/${usernames[msg.sender]}`} className="text-blue-500 hover:underline">
                    {usernames[msg.sender] || "Unknown"}
                  </Link>
                </strong>
                <p className="text-gray-700">{msg.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No messages yet. Be the first to say something!</p>
          )}
        </div>

        {/* ✅ Message Input */}
        <div className="mt-4 flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;
