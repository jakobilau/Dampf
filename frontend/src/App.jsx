import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import LibraryPage from "./Library";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/Library"
        element={
          <ProtectedRoute>
            <LibraryPage/>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;