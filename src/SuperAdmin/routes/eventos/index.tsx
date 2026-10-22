import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ListaEventos from './ListaEventos';
import CrearEvento from './CrearEvento';
import EditarEvento from './EditarEvento';
import DetalleEvento from './DetalleEvento';

const EventosRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ListaEventos />} />
      <Route path="/crear" element={<CrearEvento />} />
      <Route path="/:id" element={<DetalleEvento />} />
      <Route path="/editar/:id" element={<EditarEvento />} />
    </Routes>
  );
};

export default EventosRoutes;