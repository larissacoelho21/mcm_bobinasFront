import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";
import { NavBar } from "../Components/NavBar/NavBar";
import "../Css/VisualizarProduto.css";

import Voltar from "../assets/seta.png";

interface Material {
  nome: string;
  valor: number;
  quantidade: number;
  unidade: string;
}

export function VisualizarProduto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [nomeProduto, setNomeProduto] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:5000/api/produto/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMateriais(data.materiais);
        setNomeProduto(data.nome);
        setTotal(data.total);
      })
      .catch((err) => console.error("Erro ao buscar produto:", err));
  }, [id]);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  return (
    <div className="layout-container">
      <div className="nav">
        <NavBar />
      </div>

      <div className="menu">
        <MenuLateral />
      </div>

      <div className="produto-container">
        <header className="produto-header">
          <div className="header-left">
            <img
              src={Voltar}
              alt="Voltar"
              className="voltar"
              onClick={handleVoltar}
              style={{ cursor: "pointer" }}
            />
            <p className="produto-label">Nome Produto:</p>
            <p className="produto-nome">{nomeProduto}</p>
          </div>
          <div className="header-right">
            <p className="produto-codigo">Cód: {id}</p>
          </div>
        </header>

        <div className="tabela-container">
          <table>
            <thead>

              <tr>
                <th>Matéria Prima</th>
                <th>Valor (R$)</th>
                <th>Quantidade</th>
                <th>Unidade medida</th>
                <th>Valor Total (R$)</th>
              </tr>

            </thead>
            <tbody>
              {materiais.map((material, index) => {
                const totalItem = material.valor * material.quantidade;
                return (
                  <tr key={index}>
                    <td>{material.nome}</td>
                    <td>{formatarMoeda(material.valor)}</td>
                    <td>{material.quantidade}</td>
                    <td>{material.unidade}</td>
                    <td>{formatarMoeda(totalItem)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="tabela-footer">
            <p className="total-text">
              Total: <span>{formatarMoeda(total)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
