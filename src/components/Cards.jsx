import React from "react";
import { Link } from "react-router-dom";

const WriteupCard = ({ writeup, user, handleLike, setSelectedPost }) => {
  // Format updatedAt to "DD/MM/YYYY"
  const formattedDate = writeup.updatedAt?.seconds
    ? new Date(writeup.updatedAt.seconds * 1000).toLocaleDateString("en-GB") // en-GB for DD/MM/YYYY
    : "Unknown Date";

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <p className="text-sm text-gray-500">
        Posted by:{" "}
        <Link to={`/${writeup.username}`} className="text-blue-500 hover:underline">
          {writeup.username}
        </Link>
      </p>
      <h3 className="text-lg font-bold">{writeup.heading}</h3>
      <a 
  href={writeup.imageUrl} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-blue-500 underline mt-2 block"
>
  View Image
</a>

      <p className="text-gray-700">{writeup.writeup.slice(0, 100)}...</p>
      <button
        onClick={() => setSelectedPost(writeup)}
        className="text-blue-500 hover:underline"
      >
        Read More
      </button>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center">
          <button
            onClick={() => handleLike(writeup.id, writeup.likes || [], writeup.likesnumber || 0)}
            className="text-red-500 hover:text-red-700"
          >
            {writeup.likes?.includes(user?.email) ? "❤️" : "🤍"}
          </button>
          <span className="ml-2 text-gray-700">{writeup.likesnumber || 0} Likes</span>
        </div>
        <span className="text-sm text-gray-500">Uploaded: {writeup.updatedAt}</span> 
      </div>
    </div>
  );
};

export default WriteupCard;
