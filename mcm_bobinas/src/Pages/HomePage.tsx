import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ importado
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";
import { NavBar } from "../Components/NavBar/NavBar";
import "../Css/HomePage.css";

type ProdutoFinal = {
  id: string;
  nome: string;
  criado_em: string;
  preco_total: number;
};

export function HomePage() {
  const [produtos, setProdutos] = useState<ProdutoFinal[]>([]);
  const [busca, setBusca] = useState("");
  const navigate = useNavigate(); // ✅ inicializado

  useEffect(() => {
    fetch("http://localhost:5000/api/produtos-com-preco")
      .then((res) => res.json())
      .then((data: ProdutoFinal[]) => setProdutos(data))
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  }, []);

  const filtrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const handleClickProduto = (id: string) => {
    navigate(`/visualizarproduto/${id}`); // ✅ navegação
  };

  return (
    <section className="container">
      <NavBar />
      <MenuLateral />

      <div className="Container">
        <div className="boas-vindas">
          <h2 className="titulo">Bem vindo à calculadora da</h2>
          <h3 className="subtitulo">MCM BOBINAS!</h3>
        </div>

        <input
          type="text"
          placeholder="Pesquise um produto..."
          className="input-busca"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="recentes">
          <h4>Últimos Produtos Adicionados</h4>

          <table className="tabela">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Criado em</th>
                <th>Preço Total</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((produto, index) => (
                <tr key={index}>
                  <td>{produto.id}</td>
                  <td
                    className="link-produto"
                    onClick={() => handleClickProduto(produto.id)} // ✅ clique
                    style={{ cursor: "pointer", color: "#007bff" }}
                  >
                    {produto.nome}
                  </td>
                  <td>{produto.criado_em}</td>
                  <td className="preco">R$ {produto.preco_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
