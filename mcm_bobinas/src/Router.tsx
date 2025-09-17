import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./Pages/HomePage";
import { NavBar } from "./Components/NavBar/NavBar";
import { AdicionarProduto } from "./Pages/AddProduto";
import { MenuLateral } from "./Components/Menu Lateral/MenuLateral";
import { SimulacaoPedido } from "./Components/Simulacao Pedido/SimulacaoPedido";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage/>}></Route>

         <Route path="/addproduto" element={<AdicionarProduto/>}></Route>
         <Route path="/simulacaopedido" element={<SimulacaoPedido/>}></Route>


        {/* Components */}
        <Route path="/navbar" element={<NavBar/>}></Route>
        <Route path="/menu" element={<MenuLateral/>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;