import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import "../Css/AddProduto.css";
import "../Css/UpdateProduto.css";
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

export function EditarMateriaPrima() {
  const navigate = useNavigate();
  const { id } = useParams(); // id numérico na URL

  const [nomeProduto, setNomeProduto] = useState("");
  const [materias, setMaterias] = useState<CampoMateriaPrima[]>([]);
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [campoAtivo, setCampoAtivo] = useState<number | null>(null);

  // Carrega matérias-primas para autocomplete
  useEffect(() => {
    fetch("http://localhost:5000/api/materias")
      .then((res) => res.json())
      .then((data: MateriaPrima[]) => setMateriasPrimas(data))
      .catch((err) => console.error("Erro ao buscar matéria-prima", err));
  }, []);

  // Carrega produto pelo id
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/api/produto/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.erro) {
          toast.error("Matéria prima não encontrada");
          return;
        }

        setNomeProduto(String(data.nome ?? ""));

        const materiasConvertidas = Array.isArray(data.materiais)
          ? data.materiais.map((m: any) => {
              const qtd = Number(m.quantidade ?? 0);
              const pu = Number(m.valor ?? 0);
              return {
                materiaPrima: String(m.codigo ?? ""),
                unidade: String(m.unidade ?? ""),
                preco_unitario: pu.toString(),
                preco: (qtd * pu).toFixed(2),
                quantidade: qtd.toString(),
                textoBusca: String(m.nome ?? ""),
              } as CampoMateriaPrima;
            })
          : [];

        setMaterias(
          materiasConvertidas.length
            ? materiasConvertidas
            : [
                {
                  materiaPrima: "",
                  unidade: "",
                  preco_unitario: "0",
                  preco: "0",
                  quantidade: "0",
                  textoBusca: "",
                },
              ]
        );
      })
      .catch((err) => console.error("Erro ao buscar produto:", err));
  }, [id]);

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

        newMaterias[index].unidade = String(resultado.unidade ?? "");
        newMaterias[index].preco_unitario = String(
          resultado.preco_unitario ?? "0"
        );
        newMaterias[index].textoBusca =
          materiasPrimas.find((m) => m.codigo === value)?.nome || "";

        const qtd = Number(newMaterias[index].quantidade || 0);
        const precoUnit = Number(newMaterias[index].preco_unitario || 0);
        newMaterias[index].preco = (qtd * precoUnit).toFixed(2);
      } catch (err) {
        console.error("Erro ao buscar unidade de medida:", err);
        newMaterias[index].unidade = "";
        newMaterias[index].preco_unitario = "0";
        newMaterias[index].preco = "0";
      }
    }

    if (field === "quantidade") {
      const qtd = Number(value || 0);
      const precoUnit = Number(newMaterias[index].preco_unitario || 0);
      newMaterias[index].preco = (qtd * precoUnit).toFixed(2);
    }

    setCampoAtivo(null);
    setMaterias(newMaterias);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalido =
      !nomeProduto || materias.some((m) => !m.materiaPrima || !m.quantidade);

    if (invalido) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    const payload = {
      nomeProduto,
      materias: materias.map(
        ({ textoBusca, preco, preco_unitario, ...rest }) => rest
      ),
    };

    try {
      await axios.put(`http://localhost:5000/api/produto/${id}`, payload);
      toast.success("Matéria prima atualizada com sucesso!");
      navigate("/visualizarmateria");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar materia prima. Tente novamente");
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

  const handleDeleteProduto = async () => {
    try {
      await fetch(`http://localhost:5000/api/produto/${id}`, {
        method: "DELETE",
      });
      toast.success("Materia prima excluída com sucesso!");
      navigate("/visualizarmateria");
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      toast.error("Erro ao excluir matéria prima. Tente novamente.");
    }
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
            <h2>Editar matéria prima</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">Matéria prima:</label>

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
                value={
                  campo.preco ? `R$ ${parseFloat(campo.preco).toFixed(2)}` : ""
                }
                readOnly
                className="input readonly preco"
              />
            </div>
          ))}

          <div className="botoes">
            <button
              type="button"
              className="remove-produto"
              onClick={handleDeleteProduto}
            >
              <img src={Lixeira} alt="Remover" className="icon-lixeira" />
              <p>Excluir Matéria prima</p>
            </button>
          </div>

          <button type="submit" className="submit-button-update">
            Salvar alterações
          </button>
        </form>
      </div>
    </section>
  );
}
