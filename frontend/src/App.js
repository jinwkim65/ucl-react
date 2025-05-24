import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/pages/home';
import FindPage from './components/pages/find';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/find" element={<FindPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;