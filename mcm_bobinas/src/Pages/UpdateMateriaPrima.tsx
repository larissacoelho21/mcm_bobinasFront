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

export function UpdateMateriaPrima() {
  const navigate = useNavigate();
  const { id } = useParams(); // código atual na URL

  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [unidade, setUnidade] = useState("");
  const [precoUnitario, setPrecoUnitario] = useState("");
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [textoBusca, setTextoBusca] = useState("");
  const [showSugestoes, setShowSugestoes] = useState(false);

  // Carrega lista para autocomplete
  useEffect(() => {
    fetch("http://localhost:5000/api/materias")
      .then((res) => res.json())
      .then((data: MateriaPrima[]) => setMateriasPrimas(data))
      .catch((err) => console.error("Erro ao buscar matérias-primas:", err));
  }, []);

  // Carrega dados atuais por id/código
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/api/materias/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.erro) {
          toast.error("Matéria-prima não encontrada");
          return;
        }
        setNome(String(data.nome ?? ""));
        setCodigo(String(data.codigo ?? ""));
        setTextoBusca(String(data.nome ?? "")); // inicia input com nome atual
        setUnidade(String(data.unidade ?? ""));
        setPrecoUnitario(String(data.preco_unitario ?? "0"));
      })
      .catch((err) => console.error("Erro ao buscar matéria-prima:", err));
  }, [id]);

  // Sugestões filtradas
  const sugestoes = materiasPrimas.filter((m) =>
    m.nome.toLowerCase().includes(textoBusca.toLowerCase())
  );

  // Seleção de sugestão: define nome, código e busca unidade/preço
  const selecionarSugestao = async (item: MateriaPrima) => {
    setNome(item.nome);
    setCodigo(item.codigo);
    setTextoBusca(item.nome);
    setShowSugestoes(false);

    try {
      const res = await fetch(`http://localhost:5000/api/unidades/${item.codigo}`);
      const resultado = await res.json();
      setUnidade(String(resultado.unidade ?? ""));
      setPrecoUnitario(String(resultado.preco_unitario ?? "0"));
    } catch (err) {
      console.error("Erro ao buscar unidade de medida:", err);
      setUnidade("");
      setPrecoUnitario("0");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !codigo) {
      toast.warning("Selecione um nome válido da lista para preencher o código!");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/materias/${id}`, { nome, codigo, preco_unitario: parseFloat(precoUnitario.replace(",", ".")) });
      toast.success("Matéria-prima atualizada com sucesso!");
      navigate("/visualizarmateria");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar matéria-prima. Tente novamente");
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:5000/api/materias/${id}`, { method: "DELETE" });
      toast.success("Matéria-prima excluída com sucesso!");
      navigate("/visualizarmateria");
    } catch (err) {
      console.error("Erro ao excluir matéria-prima:", err);
      toast.error("Erro ao excluir matéria-prima. Tente novamente.");
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
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div className="title1">
            <h2>Editar matéria-prima</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">Nome da matéria-prima:</label>
          <div className="autocomplete-wrapper">
            <input
              type="text"
              placeholder="Digite para buscar…"
              value={textoBusca}
              onChange={(e) => {
                setTextoBusca(e.target.value);
                setShowSugestoes(true);
              }}
              onFocus={() => setShowSugestoes(true)}
              onBlur={() => setTimeout(() => setShowSugestoes(false), 150)}
              className="input"
              required
            />
            {showSugestoes && textoBusca && (
              <div className="sugestoes">
                {sugestoes.slice(0, 8).map((m) => (
                  <div
                    key={`sugestao-${m.codigo}`}
                    className="sugestao"
                    onMouseDown={() => selecionarSugestao(m)}
                  >
                    {m.nome}
                  </div>
                ))}
                {sugestoes.length === 0 && (
                  <div className="sugestao vazio">Nenhuma matéria-prima encontrada</div>
                )}
              </div>
            )}
          </div>

          <label className="label">Código (preenchido automaticamente):</label>
          <input
            type="text"
            value={codigo}
            readOnly
            className="input readonly"
          />

          <label className="label">Unidade:</label>
          <input
            type="text"
            value={unidade}
            readOnly
            className="input readonly"
          />

          <label className="label">Preço unitário:</label>
          <input
            type="text"
            value={precoUnitario}
            onChange={(e) => setPrecoUnitario(e.target.value)}
            className="input"
          />


          <div className="botoes">
            <button type="button" className="remove-produto" onClick={handleDelete}>
              <img src={Lixeira} alt="Remover" className="icon-lixeira" />
              <p>Excluir Matéria-prima</p>
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
