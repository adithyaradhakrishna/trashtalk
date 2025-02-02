import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    username: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [colleges, setColleges] = useState([]);
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false); // Track signup state

  useEffect(() => {
    const fetchColleges = async () => {
      const querySnapshot = await getDocs(collection(db, "collages"));
      const collegeList = querySnapshot.docs.map(doc => doc.data());
      setColleges(collegeList);
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const emailDomain = value.split("@")[1];
      const matchedCollege = colleges.find(c => c.collage_domain === emailDomain);

      if (matchedCollege) {
        setFormData(prev => ({ ...prev, college: matchedCollege.collage_name }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUsernameError("");
    setLoading(true); // Start loading

    const { name, email, password, college, username } = formData;
    const emailDomain = email.split("@")[1];
    const selectedCollege = colleges.find(c => c.collage_name === college);

    if (!selectedCollege) {
      setError("College not found in database!");
      setLoading(false); // Stop loading
      return;
    }

    if (emailDomain !== selectedCollege.collage_domain) {
      setError("Email domain does not match the college name!");
      setLoading(false); // Stop loading
      return;
    }

    // Check if username already exists
    const usernameQuery = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(usernameQuery);
    if (!querySnapshot.empty) {
      setUsernameError("Username already exists!");
      setLoading(false); // Stop loading
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        college,
        username,
        verified: false,
      });

      setSuccess("Account created! Please verify your email before logging in.");
      navigate("/")
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Stop loading when finished
    }
  };

  return (
    <div>
      <nav className="bg-[rgb(24,38,104)] p-4">
        <div className="container mx-auto flex items-center">
          <button
            className="bg-transparent text-white hover:text-gray-300 focus:outline-none mr-2"
            onClick={() => navigate("/")}
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
          <h2 className="text-2xl font-bold text-center">Create New Account</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {usernameError && <p className="text-red-500 text-center">{usernameError}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
          
          <input name="name" type="text" placeholder="Name" value={formData.name} onChange={handleChange} required className="input-field" />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="input-field" />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="input-field" />
          <input name="college" type="text" placeholder="College Name" value={formData.college || ""} readOnly required className="input-field" />
          <input name="username" type="text" placeholder="Username" value={formData.username} onChange={handleChange} required className="input-field" />
          
          <button 
            type="submit" 
            className="btn-primary w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Your college doesn't exist?{" "}
            <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/addcollege")}>
              Add your college
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
