import { useNavigate } from "react-router-dom";
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

  const materiais: Material[] = [
    { nome: "Polietileno (PE)", valor: 8.0, quantidade: 1, unidade: "kg" },
    { nome: "Polipropileno (PP)", valor: 7.0, quantidade: 1, unidade: "kg" },
    { nome: "PVC", valor: 6.0, quantidade: 1, unidade: "kg" },
    { nome: "Aço Inoxidável", valor: 12.0, quantidade: 1, unidade: "kg" },
    { nome: "Alumínio", valor: 10.0, quantidade: 1, unidade: "kg" },
    { nome: "MDF", valor: 6.0, quantidade: 1, unidade: "m²" },
    { nome: "Poliéster", valor: 9.0, quantidade: 1, unidade: "kg" },
    { nome: "Poliéster", valor: 9.0, quantidade: 1, unidade: "kg" },
    { nome: "Poliéster", valor: 9.0, quantidade: 1, unidade: "kg" },
    { nome: "Poliéster", valor: 9.0, quantidade: 1, unidade: "kg" },
  ];

  const total = materiais.reduce(
    (acc, material) => acc + material.valor * material.quantidade,
    0
  );

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

      {/* Conteúdo */}
      <div className="produto-container">
        {/* Cabeçalho */}
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
            <p className="produto-nome">Produto BBC</p>
          </div>
          <div className="header-right">
            <p className="produto-codigo">Cód: 1001</p>
          </div>
        </header>

        {/* Tabela */}

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Matéria Prima</th>
                <th>Valor (R$)</th>
                <th>Quantidade</th>
                <th>Unidade medida</th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((material, index) => (
                <tr key={index}>
                  <td>{material.nome}</td>
                  <td>{formatarMoeda(material.valor)}</td>
                  <td>{material.quantidade}</td>
                  <td>{material.unidade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Rodapé */}
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
