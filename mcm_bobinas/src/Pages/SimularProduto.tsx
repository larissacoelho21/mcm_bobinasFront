import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../Css/SimularPedido.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";
import Lixeira from "../assets/trash.png";

type Produto = {
  id: string; // pode ser string se o id não for int
  nome: string;
  preco_total: number;
};

type PedidoItem = {
  produtoId: string;
  quantidade: number;
};

export function SimularPedido() {
  const navigate = useNavigate();

  const [numeroPedido] = useState(26758); // poderia vir da API
  const [cliente, setCliente] = useState("");
  const [itens, setItens] = useState<PedidoItem[]>([
    { produtoId: "", quantidade: 1 },
  ]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Buscar produtos reais da API
  useEffect(() => {
    fetch("http://localhost:5000/api/produtos-com-preco")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  }, []);

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleAddItem = () => {
    setItens([...itens, { produtoId: "", quantidade: 1 }]);
  };

  const handleChange = (
    index: number,
    field: keyof PedidoItem,
    value: string | number
  ) => {
    const novosItens = [...itens];
    novosItens[index][field] = value as never;
    setItens(novosItens);
  };

  const calcularTotal = () => {
    return itens.reduce((acc, item) => {
      const prod = produtos.find((p) => p.id === item.produtoId);
      return acc + (prod ? prod.preco_total * item.quantidade : 0);
    }, 0);
  };

  const handleRemoveProduto = () => {
    if (itens.length > 1) {
      setItens(itens.slice(0, -1));
    }
  };

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
            <h2>Simular pedido</h2>
          </div>
        </div>

        <form className="formSimular">
          <input
            type="text"
            value={`Número do Pedido: ${numeroPedido}`}
            readOnly
            className="input readonly"
          />

          <input
            type="text"
            placeholder="Nome do Cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="input"
          />

          {itens.map((item, index) => (
            <div key={index} className="linha-produto">
              <select
                value={item.produtoId}
                onChange={(e) =>
                  handleChange(index, "produtoId", e.target.value)
                }
                className="select"
              >
                <option value="">Selecione um produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} - {formatarMoeda(p.preco_total)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Quantidade"
                value={item.quantidade}
                onChange={(e) =>
                  handleChange(index, "quantidade", Number(e.target.value))
                }
                className="input"
              />
            </div>
          ))}
        </form>

        <div className="botoes">
          <button type="button" onClick={handleAddItem} className="add-button">
            + Adicionar campo
          </button>

          <button
            type="button"
            onClick={handleRemoveProduto}
            className="remove-btn"
            disabled={itens.length <= 1}
          >
            <img src={Lixeira} alt="Remover" className="icon-lixeira" />
            <p>Remover último campo</p>
          </button>
        </div>

        <div className="total">
          Total do Pedido: <strong>{formatarMoeda(calcularTotal())}</strong>
        </div>
      </div>
    </section>
  );
}
