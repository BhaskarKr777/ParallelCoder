import { useEffect } from "react";
import AppRoutes from "../routes/AppRoutes";
import useAuthStore from "../store/authStore";

function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return <AppRoutes />;
}

export default App;
