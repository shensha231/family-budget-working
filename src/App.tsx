import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FamilyProvider } from "./contexts/FamilyContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/common/Header";
import './styles/globals.css';

// Импорты страниц
import Dashboard from "./pages/Dashboard";
import Family from "./pages/Family";
import Operations from "./pages/Operations";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <FamilyProvider>
            <div className="App">
              <Header />
              <main className="main-content">
                <div className="container">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/family" element={<Family />} />
                    <Route path="/operations" element={<Operations />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          </FamilyProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;