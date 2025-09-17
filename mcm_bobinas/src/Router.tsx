import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./Pages/HomePage";
import { NavBar } from "./Components/NavBar/NavBar";
import { MenuLateral } from "./Components/Menu Lateral/MenuLateral";
import { SimulacaoPedido } from "./Components/Simulacao Pedido/SimulacaoPedido";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage/>}></Route>
        <Route path="/MenuLateral" element={<MenuLateral/>}></Route>
        <Route path="/SimulacaoPedido" element={<SimulacaoPedido/>}></Route>

        {/* Components */}
        <Route path="/navbar" element={<NavBar/>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;