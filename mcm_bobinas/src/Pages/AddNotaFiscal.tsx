import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../Css/AddNotaFiscal.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";
import Lixeira from "../assets/trash.png";

export function AdicionarNotaFiscal() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([
    { cod: "", descricao: "", unid: "", qtd: "", vlrUnit: "" },
  ]);

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleAddProduto = () => {
    setProdutos([
      ...produtos,
      { cod: "", descricao: "", unid: "", qtd: "", vlrUnit: "" },
    ]);
  };

  const handleRemoveProduto = () => {
    if (produtos.length > 1) {
      setProdutos(produtos.slice(0, -1));
    }
  };

  const handleProdutoChange = (index, campo, valor) => {
    const novosProdutos = [...produtos];
    novosProdutos[index][campo] = valor;
    setProdutos(novosProdutos);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviando nota fiscal...");
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
            <h2>Adicionar Nota Fiscal</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="formadd">
          {/* Campos iniciais */}
          <input type="text" placeholder="Chave de acesso" />
          <input type="text" placeholder="Hora de entrada e saída" />
          <input type="date" placeholder="Data de entrada e saída" />
          <input type="date" placeholder="Data de emissão" />
          <input type="text" placeholder="Nome do fornecedor" />
          <input type="date" placeholder="Vencimento" />
          <input type="number" placeholder="Valor total dos produtos" />

          <h3>Dados do produto</h3>
          {produtos.map((produto, index) => (
            <div key={index} className="campo-produto">
              <input
                type="text"
                placeholder="Cód"
                value={produto.cod}
                onChange={(e) =>
                  handleProdutoChange(index, "cod", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Descrição do produto"
                value={produto.descricao}
                onChange={(e) =>
                  handleProdutoChange(index, "descricao", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Unid"
                value={produto.unid}
                onChange={(e) =>
                  handleProdutoChange(index, "unid", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Qtde"
                value={produto.qtd}
                onChange={(e) =>
                  handleProdutoChange(index, "qtd", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Vlr Unit"
                value={produto.vlrUnit}
                onChange={(e) =>
                  handleProdutoChange(index, "vlrUnit", e.target.value)
                }
              />
            </div>
          ))}

          <div className="botoes">
            <button type="button" onClick={handleAddProduto} className="add-btn">
              + Adicionar outro produto
            </button>

            <button
              type="button"
              onClick={handleRemoveProduto}
              className="remove-btn"
              disabled={produtos.length <= 1}
            >
              <img src={Lixeira} alt="Remover" className="icon-lixeira" />
              <p>Remover último campo</p>
            </button>
          </div>

          <input type="number" placeholder="Peso Bruto" />
          <input type="number" placeholder="Peso Líquido" />
          <input type="number" placeholder="Valor total da nota" />

          <select>
            <option value="">Forma de pagamento</option>
            <option value="pix">Pix</option>
            <option value="boleto">Boleto</option>
            <option value="cartao">Cartão</option>
            <option value="dinheiro">Dinheiro</option>
          </select>

          <button type="submit" className="submit-btn">
            Adicionar
          </button>
        </form>
      </div>
    </section>
  );
}
