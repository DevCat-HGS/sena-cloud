import React from 'react';
import { Route, Routes } from 'react-router-dom';

const ListaEquipoPedagogico = React.lazy(() => import('./ListaEquipoPedagogico'));
const DetalleEquipoPedagogico = React.lazy(() => import('./DetalleEquipoPedagogico'));
const CrearEquipoPedagogico = React.lazy(() => import('./CrearEquipoPedagogico'));
const EditarEquipoPedagogico = React.lazy(() => import('./EditarEquipoPedagogico'));

const EquipoPedagogicoRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ListaEquipoPedagogico />} />
      <Route path=":id" element={<DetalleEquipoPedagogico />} />
      <Route path="crear" element={<CrearEquipoPedagogico />} />
      <Route path=":id/editar" element={<EditarEquipoPedagogico />} />
    </Routes>
  );
};

export default EquipoPedagogicoRoutes;