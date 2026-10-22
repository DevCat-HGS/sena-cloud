import React from 'react';
import { Route, Routes } from 'react-router-dom';

const ListaCoordinadores = React.lazy(() => import('./ListaCoordinadores'));
const DetalleCoordinador = React.lazy(() => import('./DetalleCoordinador'));
const CrearCoordinador = React.lazy(() => import('./CrearCoordinador'));
const EditarCoordinador = React.lazy(() => import('./EditarCoordinador'));

const CoordinadoresRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListaCoordinadores />} />
      <Route path=":id" element={<DetalleCoordinador />} />
      <Route path="crear" element={<CrearCoordinador />} />
      <Route path=":id/editar" element={<EditarCoordinador />} />
    </Routes>
  );
};

export default CoordinadoresRoutes;