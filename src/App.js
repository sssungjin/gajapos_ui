import { useEffect } from "react";
import "./App.scss";
import PageRoutes from "./components/PageRoutes";
import BalanceProvider from "./contexts/BalanceContext";
import { AuthProvider } from "./utils/AuthProvider";

function App() {
  useEffect(() => {
    document.title = "POS4PHILL";

    const handleStorageChange = (e) => {
      if (e.key === "scannedItems") {
        console.log("scannedItems updated in storage");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthProvider>
      <BalanceProvider>
        <div className="App">
          <PageRoutes />
        </div>
      </BalanceProvider>
    </AuthProvider>
  );
}

export default App;
