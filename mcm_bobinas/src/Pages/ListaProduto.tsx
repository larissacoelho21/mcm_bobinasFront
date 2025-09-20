import { useNavigate } from "react-router-dom";

import "../Css/ListaProduto.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";

type Produto = {
  codigo: number;
  nome: string;
  valor: number;
};

export function ListaProdutos() {
  const navigate = useNavigate();

  const produtos: Produto[] = [
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
  ];

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleClickProduto = (codigo: number) => {
    navigate(`/produto/${codigo}`);
  };

  return (
    <section className="container">
      <div className="nav">
        <NavBar />
      </div>

      <div className="menu">
        <MenuLateral />
      </div>

      <div className="Container">
        {/* Título */}
        <div className="title">
          <div className="img">
            <img
              src={Voltar}
              alt="Voltar"
              className="voltar"
              onClick={handleVoltar}
              style={{ cursor: "pointer" }}
            />
          </div>

          <div className="title1">
            <h2>Lista de Produtos</h2>
          </div>
        </div>

        {/* Tabela */}
        <table className="tabela-produtos">
          <thead>
            <tr>
              <th>Cód</th>
              <th>Nome Produto</th>
              <th>Valor unidade atualizado</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.codigo}>
                <td className="codigo">{produto.codigo}</td>
                <td
                  className="link-produto"
                  onClick={() => handleClickProduto(produto.codigo)}
                >
                  {produto.nome}
                </td>
                <td>
                  R${" "}
                  {produto.valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
