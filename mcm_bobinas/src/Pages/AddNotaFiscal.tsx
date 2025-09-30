import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';

import "../Css/AddNotaFiscal.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";
import Lixeira from "../assets/trash.png";

type ProdutoSalvo = {
  codigo: string;
  nome: string;
  valor: number;
};

type CampoProduto = {
  cod: string;
  nome: string;
  unid: string;
  qtd: string;
  vlrUnit: string;
  textoBusca: string;
};

export function AdicionarNotaFiscal() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<CampoProduto[]>([
    { cod: "", nome: "", unid: "", qtd: "", vlrUnit: "", textoBusca: "" },
  ]);
  const [produtosSalvos, setProdutosSalvos] = useState<ProdutoSalvo[]>([]);
  const [fornecedor, setFornecedor] = useState("");
  const [emissao, setEmissao] = useState("");
  const [valorTotalNota, setValorTotalNota] = useState("0.00");
  const [campoAtivo, setCampoAtivo] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/materias")
      .then((res) => res.json())
      .then((data: ProdutoSalvo[]) => setProdutosSalvos(data))
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  }, []);

  const handleAddProduto = () => {
    setProdutos([
      ...produtos,
      { cod: "", nome: "", unid: "", qtd: "", vlrUnit: "", textoBusca: "" },
    ]);
  };

  const handleRemoveProduto = () => {
    if (produtos.length > 1) {
      const novos = produtos.slice(0, -1);
      setProdutos(novos);
      calcularTotalNota(novos);
    }
  };

  const handleProdutoChange = async (
    index: number,
    campo: keyof CampoProduto,
    valor: string
  ) => {
    const novosProdutos = [...produtos];
    novosProdutos[index][campo] = valor;

    if (campo === "textoBusca") {
      setCampoAtivo(index);

      const produtoEncontrado = produtosSalvos.find((p) =>
        p.nome.toLowerCase() === valor.toLowerCase()
      );

      if (produtoEncontrado) {
        novosProdutos[index].nome = produtoEncontrado.nome;
        novosProdutos[index].cod = produtoEncontrado.codigo;
        novosProdutos[index].vlrUnit = produtoEncontrado.valor.toString();

        try {
          const res = await fetch(`http://localhost:5000/api/unidades/${produtoEncontrado.codigo}`);
          const dados = await res.json();
          novosProdutos[index].unid = dados.unidade || "";
        } catch (err) {
          console.error("Erro ao buscar unidade:", err);
          novosProdutos[index].unid = "";
        }
      }

      setProdutos(novosProdutos);
      return;
    }

    if (campo === "vlrUnit" || campo === "qtd") {
      const qtd = campo === "qtd" ? parseFloat(valor) : parseFloat(novosProdutos[index].qtd);
      const vlr = campo === "vlrUnit" ? parseFloat(valor) : parseFloat(novosProdutos[index].vlrUnit);

      if (!isNaN(qtd) && !isNaN(vlr)) {
        const total = produtos.reduce((acc, item, i) => {
          const q = i === index ? qtd : parseFloat(item.qtd);
          const v = i === index ? vlr : parseFloat(item.vlrUnit);
          return acc + (isNaN(q) || isNaN(v) ? 0 : q * v);
        }, 0);
        setValorTotalNota(total.toFixed(2));
      }
    }

    setCampoAtivo(null);
    setProdutos(novosProdutos);
  };

  const calcularTotalNota = (lista: CampoProduto[]) => {
    const soma = lista.reduce((acc, item) => {
      const qtd = parseFloat(item.qtd);
      const vlr = parseFloat(item.vlrUnit);
      return acc + (isNaN(qtd) || isNaN(vlr) ? 0 : qtd * vlr);
    }, 0);
    setValorTotalNota(soma.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const produto of produtos) {
      if (!produto.cod || !produto.nome || !produto.unid || !produto.qtd || !produto.vlrUnit) {
        toast.warning("Preencha todos os campos da matéria-prima.");
        return;
      }

      const payload = {
        cod: produto.cod,
        nome: produto.nome,
        unid: produto.unid,
        qtd: parseFloat(produto.qtd),
        vlrUnit: parseFloat(produto.vlrUnit),
        fornecedor,
        emissao,
      };

      try {
        const response = await fetch("http://localhost:5000/api/inserir-nota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar nota fiscal");
        }
      } catch (error) {
        console.error(error);
        toast.error('Erro ao enviar nota fiscal');
        return;
      }
    }

    toast.success("Nota fiscal enviada com sucesso!");
    navigate("/visualizarmateria");
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const getSugestoes = (texto: string) => {
    return produtosSalvos.filter((p) =>
      p.nome.toLowerCase().includes(texto.toLowerCase())
    );
  };

  return (
    <section className="container">
      <div className="nav"><NavBar /></div>
      <div className="menu"><MenuLateral /></div>

      <div className="Container">
        <div className="title">
          <div className="img">
            <img src={Voltar} alt="Voltar" className="voltar" onClick={handleVoltar} style={{ cursor: "pointer" }} />
          </div>
          <div className="title1"><h2>Adicionar Nota Fiscal</h2></div>
        </div>

        <form onSubmit={handleSubmit} className="formadd">
          <input type="text" placeholder="Chave de acesso" />
          <input type="date" placeholder="Data de emissão" value={emissao} onChange={(e) => setEmissao(e.target.value)} />
          <input type="text" placeholder="Nome do fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} />

          <h3>Dados da matéria prima</h3>
          {produtos.map((produto, index) => (
            <div key={index} className="campo-produto">
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  placeholder="Nome da matéria-prima"
                  value={produto.textoBusca}
                  onChange={(e) => handleProdutoChange(index, "textoBusca", e.target.value)}
                  onFocus={() => setCampoAtivo(index)}
                />
                {campoAtivo === index && produto.textoBusca && (
                  <div className="sugestoes">
                    {getSugestoes(produto.textoBusca).map((p, i) => (
                      <div
                        key={`sugestao-${p.codigo}-${i}`}
                        className="sugestao"
                        onClick={async () => {
                          const novosProdutos = [...produtos];
                          novosProdutos[index].textoBusca = p.nome;
                          novosProdutos[index].nome = p.nome;
                          novosProdutos[index].cod = p.codigo;
                          novosProdutos[index].vlrUnit = p.valor.toString();

                          try {
                            const res = await fetch(`http://localhost:5000/api/unidades/${p.codigo}`);
                            const dados = await res.json();
                                                       novosProdutos[index].unid = dados.unidade || "";
                          } catch (err) {
                            console.error("Erro ao buscar unidade:", err);
                            novosProdutos[index].unid = "";
                          }

                          setProdutos(novosProdutos);
                          setCampoAtivo(null);
                        }}
                      >
                        {p.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Unid"
                value={produto.unid ?? ""}
                readOnly
              />

              <input
                type="number"
                placeholder="Qtde"
                value={produto.qtd ?? ""}
                onChange={(e) => handleProdutoChange(index, "qtd", e.target.value)}
              />

              <input
                type="number"
                placeholder="Vlr Unit"
                value={produto.vlrUnit ?? ""}
                onChange={(e) => handleProdutoChange(index, "vlrUnit", e.target.value)}
              />
            </div>
          ))}

          <div className="botoes">
            <button type="button" onClick={handleAddProduto} className="add-btn">
              + Adicionar outra matéria prima
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
          <input
            type="number"
            placeholder="Valor total da nota"
            value={valorTotalNota}
            readOnly
          />
          <button type="submit" className="submit-btn">
            Adicionar
          </button>
        </form>
      </div>
    </section>
  );
}

