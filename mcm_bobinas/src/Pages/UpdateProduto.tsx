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

export function EditarProduto() {
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
      .catch((err) => console.error("Erro ao buscar matérias-primas:", err));
  }, []);

  // Carrega ficha técnica pelo id
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:5000/api/fichas_tecnicas/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.erro) {
          toast.error("Ficha técnica não encontrada");
          return;
        }

        // Ajuste conforme o backend: se vier "descricao" em vez de "nome"
        setNomeProduto(String(data.nome ?? data.descricao ?? ""));

        const materiasConvertidas = Array.isArray(data.materiais ?? data.itens)
          ? (data.materiais ?? data.itens).map((m: any) => {
              const qtd = Number(m.quantidade ?? 0);
              const pu = Number(m.preco_unitario ?? m.valor ?? 0);
              return {
                materiaPrima: String(m.codigo ?? m.codigo_materia ?? ""),
                unidade: String(m.unidade ?? ""),
                preco_unitario: pu.toString(),
                preco: (qtd * pu).toFixed(2),
                quantidade: qtd.toString(),
                textoBusca: String(m.nome ?? m.descricao ?? ""),
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
      .catch((err) => console.error("Erro ao buscar ficha técnica:", err));
  }, [id]);

  // ➕ Adicionar novo campo
  const handleAddCampo = () => {
    setMaterias((prev) => [
      ...prev,
      {
        materiaPrima: "",
        unidade: "",
        preco_unitario: "0",
        preco: "0",
        quantidade: "0",
        textoBusca: "",
      },
    ]);
  };

  // ➖ Remover último campo
  const handleRemoveCampo = () => {
    setMaterias((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  // Atualiza campos
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
        newMaterias[index].preco_unitario = String(resultado.preco_unitario ?? "0");
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

  // Salvar alterações (update em fichas_tecnicas)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalido =
      !nomeProduto ||
      materias.some(
        (m) => !m.materiaPrima || !m.textoBusca || Number(m.quantidade) <= 0
      );

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

    console.log("Payload enviado:", payload);

    try {
      await axios.put(`http://localhost:5000/api/fichas_tecnicas/${id}`, payload);
      toast.success("Ficha técnica atualizada com sucesso!");
      navigate("/listaprodutos");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar ficha técnica. Tente novamente");
    }
  };

  const handleVoltar = () => navigate(-1);

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
            <h2>Editar produto</h2>
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
                        onClick={() => {
                          handleChange(index, "textoBusca", m.nome);
                          handleChange(index, "materiaPrima", m.codigo);
                        }}
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

          <button type="submit" className="submit-button-update">
            Salvar alterações
          </button>
        </form>
      </div>
    </section>
  );
}
