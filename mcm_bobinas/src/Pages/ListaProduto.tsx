import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "../Css/ListaProduto.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";

type Produto = {
  id: number;
  nome: string;
  preco_total: number;
};

export function ListaProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/produtos-com-preco")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  }, []);

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleClickProduto = (id: number) => {
    navigate(`/visualizarproduto/${id}`);
  };

  return (
    <div className="layout-container-produto">
      <div className="nav">
        <NavBar />
      </div>

      <div className="menu">
        <MenuLateral />
      </div>

      <div className="produto-container-produto">
        <header className="header-produto">
          <div className="header-col">
            <img
              src={Voltar}
              alt="Voltar"
              className="voltar"
              onClick={handleVoltar}
            />
            <span>Cód</span>
          </div>

          <div className="nome-col">
            <span>Nome Produto</span>
          </div>

          <div className="valor-col">
            <span>Valor unidade atualizado</span>
          </div>
        </header>

        <div className="tabela-produto">
          <table>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td className="codigo">{produto.id}</td>
                  <td
                    className="link-produto"
                    onClick={() => handleClickProduto(produto.id)}
                  >
                    {produto.nome}
                  </td>
                  <td className="preco-produto">
                    R${" "}
                    {produto.preco_total.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
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
