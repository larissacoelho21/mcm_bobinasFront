import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./Pages/HomePage";
import { NavBar } from "./Components/NavBar/NavBar";
import { AdicionarProduto } from "./Pages/AddProduto";
import { MenuLateral } from "./Components/Menu Lateral/MenuLateral";
import { AdicionarNotaFiscal } from "./Pages/AddNotaFiscal";
import { SimularPedido } from "./Pages/SimularProduto";
import { VisualizarProduto } from "./Pages/VisualizarProduto";
import { ListaProdutos } from "./Pages/ListaProduto";
import { VisualizarMateriaPrima } from "./Pages/ListaMateriaPrima";
import { EditarProduto } from "./Pages/UpdateProduto";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Páginas */}
        <Route path="/addproduto" element={<AdicionarProduto />} />
        <Route path="/addnotafiscal" element={<AdicionarNotaFiscal />} />
        <Route path="/simularpedido" element={<SimularPedido />} />
        <Route path="/listaprodutos" element={<ListaProdutos />} />
        <Route path="/visualizarproduto" element={<VisualizarProduto />} />
        <Route path="/visualizarproduto/:id" element={<VisualizarProduto />} />
        <Route path="/visualizarmateria" element={<VisualizarMateriaPrima />} />
        <Route path="/editarproduto/:id" element={<EditarProduto />} />
        {/* Components */}
        <Route path="/navbar" element={<NavBar />} />
        <Route path="/menu" element={<MenuLateral />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
