import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AddCollege = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    collegeName: "",
    collegeDomain: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { collegeName, collegeDomain } = formData;

    // Validation
    if (!collegeName || !collegeDomain) {
      setError("Both fields are required.");
      return;
    }

    try {
      await addDoc(collection(db, "collages"), {
        collage_name: collegeName,
        collage_domain: collegeDomain,
      });

      setSuccess("College added successfully!");
      navigate("/signup")
      setFormData({ collegeName: "", collegeDomain: "" });
    } catch (err) {
      setError("Error adding college. Please try again.");
    }
  };

  return (
    <div>
      <nav className="bg-[rgb(24,38,104)] p-4">
        <div className="container mx-auto flex items-center">
          <button
            className="bg-transparent text-white hover:text-gray-300 focus:outline-none mr-2"
            onClick={() => navigate("/signup")}
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-white text-2xl font-bold">MyApp</div>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
          <h2 className="text-2xl font-bold text-center">Add College</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
          
          <input 
            name="collegeName" 
            type="text" 
            placeholder="College Name" 
            value={formData.collegeName} 
            onChange={handleChange} 
            required 
            className="input-field" 
          />
          <input 
            name="collegeDomain" 
            type="text" 
            placeholder="College Domain (e.g., example.edu)" 
            value={formData.collgeDomain} 
            onChange={handleChange} 
            required 
            className="input-field" 
          />
          
          <button type="submit" className="btn-primary w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add College
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Want to go back to sign-up?{" "}
            <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/signup")}>
              Go to Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AddCollege;
