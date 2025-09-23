import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { toast } from 'sonner';

import "../Css/AddProduto.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";
import Lixeira from "../assets/trash.png";

type MateriaPrima = {
  codigo: string;
  nome: string;
};

type CampoMateriaPrima = {
  materiaPrima: string;
  unidade: string;
  preco_unitario: string;
  preco: string;
  quantidade: string;
  textoBusca: string;
};

export function AdicionarProduto() {
  const navigate = useNavigate();

  const [nomeProduto, setNomeProduto] = useState("");
  const [codigoProduto, setCodigoProduto] = useState("");
  const [materias, setMaterias] = useState<CampoMateriaPrima[]>([
    { materiaPrima: "", unidade: "", preco_unitario: "", preco: "", quantidade: "", textoBusca: "" },
  ]);
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [campoAtivo, setCampoAtivo] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/materias")
      .then((res) => res.json())
      .then((data: MateriaPrima[]) => setMateriasPrimas(data))
      .catch((err) => console.error("Erro ao buscar matérias-primas:", err));
  }, []);

  const handleAddCampo = () => {
    setMaterias([
      ...materias,
      { materiaPrima: "", unidade: "", preco_unitario: "", preco: "", quantidade: "", textoBusca: "" },
    ]);
  };

  const handleRemoveCampo = () => {
    if (materias.length > 1) {
      setMaterias(materias.slice(0, -1));
    }
  };

  const handleChange = async (
    index: number,
    field: keyof CampoMateriaPrima,
    value: string
  ) => {
    const newMaterias = [...materias];
    newMaterias[index][field] = value;

    if (field === "textoBusca") {
      setCampoAtivo(index);
      setMaterias(newMaterias);
      return;
    }

    if (field === "materiaPrima") {
      try {
        const res = await fetch(`http://localhost:5000/api/unidades/${value}`);
        const resultado = await res.json();

        newMaterias[index].unidade = resultado.unidade || "";
        newMaterias[index].preco_unitario = resultado.preco_unitario?.toString() || "";
        newMaterias[index].textoBusca =
          materiasPrimas.find((m) => m.codigo === value)?.nome || "";

        const qtd = parseFloat(newMaterias[index].quantidade);
        const precoUnit = parseFloat(newMaterias[index].preco_unitario);
        if (!isNaN(qtd) && !isNaN(precoUnit)) {
          newMaterias[index].preco = (qtd * precoUnit).toFixed(2);
        }
      } catch (err) {
        console.error("Erro ao buscar unidade de medida:", err);
        newMaterias[index].unidade = "";
        newMaterias[index].preco_unitario = "";
        newMaterias[index].preco = "";
      }
    }

    if (field === "quantidade") {
      const qtd = parseFloat(value);
      const precoUnit = parseFloat(newMaterias[index].preco_unitario);
      if (!isNaN(qtd) && !isNaN(precoUnit)) {
        newMaterias[index].preco = (qtd * precoUnit).toFixed(2);
      } else {
        newMaterias[index].preco = "";
      }
    }

    setCampoAtivo(null);
    setMaterias(newMaterias);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeProduto || !codigoProduto || materias.some(m => !m.materiaPrima || !m.quantidade)) {
      toast.warning('Preencha todos os campos!');
      return;
    }

    const data = {
      nomeProduto,
      codigoProduto,
      materias: materias.map(({ textoBusca, preco, preco_unitario, ...rest }) => rest),
    };

    try {
      await axios.post("http://localhost:5000/api/produto", data);
      toast.success('Produto adicionado com sucesso!');
      setNomeProduto("");
      setCodigoProduto("");
      setMaterias([{ materiaPrima: "", unidade: "", preco_unitario: "", preco: "", quantidade: "", textoBusca: "" }]);
      navigate("/listaprodutos");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      toast.error('Erro ao enviar produto. Tente novamente');
    }
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const getSugestoes = (texto: string) => {
    return materiasPrimas.filter((m) =>
      m.nome.toLowerCase().includes(texto.toLowerCase())
    );
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
            <h2>Adicionar produto</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Nome do produto"
            value={nomeProduto}
            onChange={(e) => setNomeProduto(e.target.value)}
            className="input"
            required
          />

          <input
            type="text"
            placeholder="Código do produto"
            value={codigoProduto}
            onChange={(e) => setCodigoProduto(e.target.value)}
            className="input"
            required
          />

          <label className="label">Matéria prima utilizada:</label>

          {materias.map((campo, index) => (
            <div key={index} className="campo-materia">
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  placeholder="Matéria-prima"
                  value={campo.textoBusca}
                  onChange={(e) =>
                    handleChange(index, "textoBusca", e.target.value)
                  }
                  className="input"
                  onFocus={() => setCampoAtivo(index)}
                  required
                />
                {campoAtivo === index && campo.textoBusca && (
                  <div className="sugestoes">
                    {getSugestoes(campo.textoBusca).map((m, i) => (
                      <div
                        key={`sugestao-${m.codigo}-${i}`}
                        className="sugestao"
                        onClick={() =>
                          handleChange(index, "materiaPrima", m.codigo)
                        }
                      >
                        {m.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="number"
                placeholder="Quantidade"
                value={campo.quantidade}
                onChange={(e) =>
                  handleChange(index, "quantidade", e.target.value)
                }
                className="number-input"
                required
              />

              <input
                type="text"
                placeholder="Unidade de medida"
                value={campo.unidade}
                readOnly
                className="input readonly"
              />

              <input
                type="text"
                placeholder="Preço"
                value={campo.preco ? `R$ ${parseFloat(campo.preco).toFixed(2)}` : ""}
                readOnly
                className="input readonly preco"
              />

            </div>
          ))}

          <div className="botoes">
            <button
              type="button"
              onClick={handleAddCampo}
              className="add-button"
            >
              + Adicionar Matéria Prima
            </button>

            <button
              type="button"
              onClick={handleRemoveCampo}
              className="remove-button"
              disabled={materias.length <= 1}
            >
              <img
                src={Lixeira}
                alt="Remover último"
                className="icon-lixeira"
              />
              <p>Remover último campo</p>
            </button>
          </div>

          <button type="submit" className="submit-button">
            Adicionar
          </button>
        </form>
      </div>
    </section>
  );
}
