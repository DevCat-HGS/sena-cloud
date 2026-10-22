import React from 'react';
import { Route, Routes } from 'react-router-dom';

const ListaAdministradores = React.lazy(() => import('./ListaAdministradores'));
const DetalleAdministrador = React.lazy(() => import('./DetalleAdministrador'));
const CrearAdministrador = React.lazy(() => import('./CrearAdministrador'));
const EditarAdministrador = React.lazy(() => import('./EditarAdministrador'));

const AdministradoresRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListaAdministradores />} />
      <Route path=":id" element={<DetalleAdministrador />} />
      <Route path="crear" element={<CrearAdministrador />} />
      <Route path=":id/editar" element={<EditarAdministrador />} />
    </Routes>
  );
};

export default AdministradoresRoutes;