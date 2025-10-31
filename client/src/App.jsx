import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ViewFile from "./pages/ViewFile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view/:id" element={<ViewFile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;