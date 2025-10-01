import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import MinimalHomePage from './pages/MinimalHomePage';
import MeasurementFlow from './pages/MeasurementFlow';
import VirtualFitting from './pages/VirtualFitting';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MinimalHomePage />} />
          <Route path="/measurements" element={<MeasurementFlow />} />
          <Route path="/virtual-fitting" element={<VirtualFitting />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
