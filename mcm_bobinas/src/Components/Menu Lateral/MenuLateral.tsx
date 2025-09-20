import { NavLink } from "react-router-dom";
import logonome from "../../assets/logonome.png";
import upload from "../../assets/Upload.png";
import "./MenuLateral.css";

export function MenuLateral() {
  return (
    <div className="container">
      <section className="menu-lateral-container">
        {/* Seção do Menu */}
        <nav className="menu-section">
          {/* Seção do Logo */}
          <div className="logo-section">
            <img src={logonome} alt="MCM Bobinas Logo" className="logo" />
          </div>

          <div className="list">
            <NavLink /* identificando se o caminho da página selecionada corresponde */
              className={({ isActive }) =>
                isActive ? "menu-link active" : "menu-link"
              }
              to={"/addproduto"}
            >
              <p className="menu-item">Adicionar produto</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "menu-link active" : "menu-link"
              }
              to={"/addnotafiscal"}
            >
              <p className="menu-item">Adicionar nota fiscal</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                isActive ? "menu-link active" : "menu-link"
              }
              to={"/simularpedido"}
            >
              <p className="menu-item">Simular pedido</p>
            </NavLink>
          </div>
        </nav>

        {/* Seção de Upload */}
        <div className="logo-section">
          <img src={upload} alt="upload" className="upload" />
        </div>
      </section>
    </div>
  );
}
