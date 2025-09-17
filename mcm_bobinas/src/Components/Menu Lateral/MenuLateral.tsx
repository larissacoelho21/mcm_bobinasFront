import { NavBar } from '../NavBar/NavBar'; // Importe a NavBar uma única vez
import logonome from "../../assets/logonome.png"
import upload from "../../assets/Upload.png"
import './MenuLateral.css'; 


export function MenuLateral() {
  return (
    <div className="container">
      <div className="nav">
        <NavBar />
      </div>
      
      
      <section className="menu-lateral-container">
       {/* Seção do Menu */}
        <nav className="menu-section">
        {/* Seção do Logo */}
      <div className="logo-section">
        <img src={logonome} alt="MCM Bobinas Logo" className="logo" />
      </div>
        <a href="#" className="menu-item">
          Adicionar produto
        </a>
        <br></br>
        <a href="#" className="menu-item">
          Adicionar nota fiscal
        </a>
        <br></br>
        <a href="#" className="menu-item">
          Simulação pedido
        </a>
        <br></br><br></br><br></br><br></br><br></br>
      </nav>

      {/* Seção de Upload */}
      <div className="logo-section">
        <img src={upload} alt="MCM Bobinas Logo" className="logo" />
      </div>

      </section>
      
    </div>

      );
}

   
