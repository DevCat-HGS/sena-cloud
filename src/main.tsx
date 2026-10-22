import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter} from "react-router-dom";
// Comentado temporalmente para evitar errores de conexión WebSocket
// import { SocketProvider } from "./Service/API/SocketContext";
import { AuthProvider } from "./Service/API/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
  <BrowserRouter future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}>
    <AuthProvider>
      {/* Comentado temporalmente para evitar errores de conexión WebSocket
      <SocketProvider>
        <App />
      </SocketProvider>
      */}
      <App />
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </AuthProvider>
  </BrowserRouter>
);
