// /src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Adduser';
import SignIn from './pages/Login';
import Home from './pages/Home';
import Post from './pages/Post';
import CollegeForm from './pages/Addcollage';
  import Chatroom from './pages/Chatroom';
  import UserProfile from './pages/Userprofile';
const App = () => {
  return (
    <Router>

        <Routes>
        <Route path="/" element={<SignIn />} />    {/* Login Page */}

          <Route path="/signup" element={<Signup />} />    {/* Login Page */}
          <Route path="/home" element={<Home />} />    {/* Login Page */}
          <Route path="/post" element={<Post />} />    {/* Login Page */}
          <Route path="/chatroom" element={<Chatroom />} />    {/* Login Page */}
          <Route path="/:username" element={<UserProfile />} />
          <Route path="/addcollege" element={<CollegeForm />} />    {/* Login Page */}

        </Routes>
    
    </Router>
  );
};

export default App;
