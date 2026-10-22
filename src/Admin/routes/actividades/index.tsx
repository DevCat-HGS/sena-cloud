import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ListaActividades } from './ListaActividades';
import { CrearActividad } from './CrearActividad';
import { DetalleActividad } from './DetalleActividad';
import { EditarActividad } from './EditarActividad';

export const ActividadesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ListaActividades />} />
      <Route path="/crear" element={<CrearActividad />} />
      <Route path="/:id" element={<DetalleActividad />} />
      <Route path="/editar/:id" element={<EditarActividad />} />
    </Routes>
  );
};

export default ActividadesRoutes;