import { NavLink, Link } from "react-router-dom";

import Nome from "../../assets/logo.svg";

import "../NavBar/NavBar.css";

export function NavBar() {
  return (
    <section className="navbar">
      <nav>
        <div className="navBarDefault">
          <div className="left-side">
            <div className="nav-logo">
              <Link to="/">
                <img src={Nome} alt="" />
              </Link>
            </div>
          </div>

          <div className="right-side">
            <div className="nav-list">
              <ul className="navbar-nav">
                <NavLink /* identificando se o caminho da página selecionada corresponde */
                  className={({ isActive }) =>
                    isActive ? "navbar-link active" : "navbar-link"
                  }
                  to={"/"}
                >
                  <p className="parag">Início</p>
                </NavLink>
                
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "navbar-link active" : "navbar-link"
                  }
                  to={"/listaprodutos"}
                >
                  <p className="parag">Produtos</p>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    isActive ? "navbar-link active" : "navbar-link"
                  }
                  to={"/visualizarmateria"}
                >
                  <p className="parag">Matérias Primas</p>
                </NavLink>
              </ul>
            </div>
          </div>
        </div>
        <div className="linha"></div>
      </nav>
    </section>
  );
}
