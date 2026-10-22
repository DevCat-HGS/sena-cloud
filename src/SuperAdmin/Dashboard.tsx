import { ThemeProvider } from "./contexts/theme-context.tsx";
import Layout from "./routes/layout.tsx";
import './index.css'

function SuperAdminDashboard() {
    return (
        <ThemeProvider storageKey="theme">
            <Layout />
        </ThemeProvider>
    );
}

export default SuperAdminDashboard;
