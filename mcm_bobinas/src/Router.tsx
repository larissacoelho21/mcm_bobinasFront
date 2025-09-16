import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./Pages/HomePage";
import { NavBar } from "./Components/NavBar/NavBar";
import { AdicionarProduto } from "./Pages/AddProduto";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage/>}></Route>

        {/* Páginas */}
        <Route path="/addproduto" element={<AdicionarProduto/>}></Route>

        {/* Components */}
        <Route path="/navbar" element={<NavBar/>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;