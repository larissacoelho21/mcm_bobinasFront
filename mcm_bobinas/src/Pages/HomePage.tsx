import { useState } from "react";
import "../Css/HomePage.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

type Produto = {
  id: number;
  nome: string;
  dataCriacao: string;
  precoTotal: number;
};

export function HomePage() {
  const [busca, setBusca] = useState("");

  // Exemplo de produtos (puxar de API depois)
  const produtos: Produto[] = [
    { id: 1, nome: "Produto BBC", dataCriacao: "19/09/2025", precoTotal: 250 },
    { id: 2, nome: "Produto X", dataCriacao: "18/09/2025", precoTotal: 180 },
    { id: 3, nome: "Produto Alpha", dataCriacao: "15/09/2025", precoTotal: 300 },
    { id: 4, nome: "Produto ZY", dataCriacao: "10/09/2025", precoTotal: 90 },
  ];

  const filtrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="layout-container-home">
      <div className="nav">
        <NavBar />
      </div>

      <div className="menu">
        <MenuLateral />
      </div>

      <div className="home-container">
        <h2 className="titulo">Bem vindo á calculadora da</h2>
        <h3 className="subtitulo">MCM BOBINAS!</h3>

        <input
          type="text"
          placeholder="Pesquise um produto..."
          className="input-busca"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {/* Tabela de recentes */}
        <div className="recentes">
          <h4>Recentes</h4>

          <table className="tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Data de criação</th>
                <th>Preço total</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.id}</td>
                  <td>{produto.nome}</td>
                  <td>{produto.dataCriacao}</td>
                  <td className="preco">R$ {produto.precoTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
