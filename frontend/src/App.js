import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './components/pages/home';
import FindPage from './components/pages/find';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/find" element={<FindPage />} />
      </Routes>
    </Router>
  );
}

export default App;