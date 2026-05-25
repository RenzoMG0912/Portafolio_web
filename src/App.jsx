import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Portfolio from "./components/Portfolio";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/sobre-mi" element={<Portfolio />} />
      <Route path="/habilidades" element={<Portfolio />} />
      <Route path="/proyectos" element={<Portfolio />} />
      <Route path="/sesiones" element={<Portfolio />} />
      <Route path="/contacto" element={<Portfolio />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
