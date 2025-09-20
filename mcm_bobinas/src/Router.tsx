import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./Pages/HomePage";
import { NavBar } from "./Components/NavBar/NavBar";
import { AdicionarProduto } from "./Pages/AddProduto";
import { MenuLateral } from "./Components/Menu Lateral/MenuLateral";
import { AdicionarNotaFiscal } from "./Pages/AddNotaFiscal";
import { SimularPedido } from "./Pages/SimularProduto";
import { VisualizarProduto } from "./Pages/VisualizarProduto";
import { ListaProdutos } from "./Pages/ListaProduto";
/* import { SimulacaoPedido } from "./Components/Simulacao Pedido/SimulacaoPedido"; */

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage/>}></Route>

        {/* Páginas */}
        <Route path="/addproduto" element={<AdicionarProduto/>}></Route>
        <Route path="/addnotafiscal" element={<AdicionarNotaFiscal/>}></Route>
        <Route path="/simularpedido" element={<SimularPedido/>}></Route>
        <Route path="/listaprodutos" element={<ListaProdutos/>}></Route>
        <Route path="/visualizarproduto" element={<VisualizarProduto/>}></Route>
        

        {/* Components */}
        <Route path="/navbar" element={<NavBar/>}></Route>
        <Route path="/menu" element={<MenuLateral/>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;