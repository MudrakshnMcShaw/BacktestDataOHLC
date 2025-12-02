import React from "react";
import TVChart from "./TVChart";
import { Toaster } from 'sonner';

function App() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Toaster richColors position="top-center" />
      <TVChart />
    </div>
  );
}

export default App;
