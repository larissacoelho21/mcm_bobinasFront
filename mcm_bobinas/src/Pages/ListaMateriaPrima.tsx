import { useNavigate } from "react-router-dom";

import "../Css/ListaMateriaPrima.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";

type Materia = {
  codigo: number;
  nome: string;
  valor: number;
};


export function VisualizarMateriaPrima() {
  const navigate = useNavigate();

  const materias: Materia[] = [
    { codigo: 1001, nome: "Produto BBC", valor: 57.6 },
    { codigo: 1002, nome: "Produto X", valor: 120.1 },
    { codigo: 1003, nome: "Produto Y", valor: 95.0 },
    { codigo: 1004, nome: "Produto ZX", valor: 150.99 },
    { codigo: 1005, nome: "Produto Alpha", valor: 100.0 },
    { codigo: 1006, nome: "Produto Omega", valor: 1000.9 },
    { codigo: 1007, nome: "Produto Delta", valor: 60.0 },
    { codigo: 1008, nome: "Produto Sigma", valor: 80.0 },
    { codigo: 1009, nome: "Produto Kappa", valor: 92.1 },
    { codigo: 1010, nome: "Produto Zeta", valor: 2500.0 },
    { codigo: 1010, nome: "Produto Zeta", valor: 2500.0 },
    { codigo: 1009, nome: "Produto Kappa", valor: 92.1 },
    { codigo: 1010, nome: "Produto Zeta", valor: 2500.0 },
    { codigo: 1010, nome: "Produto Zeta", valor: 2500.0 },
  ];

  const handleVoltar = () => {
    navigate(-1);
  };

  return (
    <div className="layout-container-materia">
      <div className="nav">
        <NavBar />
      </div>

      <div className="menu">
        <MenuLateral />
      </div>

      <div className="produto-container-materia">
        {/* Cabeçalho isolado */}
        <header className="header-materia">
          <div className="header-column">
            <img
              src={Voltar}
              alt="Voltar"
              className="voltar"
              onClick={handleVoltar}
            />
            <span>Cód</span>
          </div>

          <div className="nome-column">
            <span>Nome Produto</span>
          </div>

          <div className="valor-column">
            <span>Valor unidade atualizado</span>
          </div>
        </header>

        {/* Caixa da tabela */}
        <div className="tabela-materia">
          <table>
            <tbody>
              {materias.map((materia) => (
                <tr /* key={produto.codigo} */>
                  <td className="codigo">{materia.codigo}</td>
                  <td
                    className="link-produto"
                  >
                    {materia.nome}
                  </td>
                  <td className="preco">
                    R${" "}
                    {materia.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
