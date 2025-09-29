import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import "../Css/ListaMateriaPrima.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";
import Editar from "../assets/pencil.png";


type Materia = {
  id: string;
  codigo: number;
  nome: string;
  valor: number;
  data: Date;
};

export function VisualizarMateriaPrima() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [busca, setBusca] = useState(""); // ✅ estado da busca

  useEffect(() => {
    fetch("http://localhost:5000/api/materias")
      .then((res) => res.json())
      .then((data) => setMaterias(data))
      .catch((err) => console.error("Erro ao buscar matérias-primas:", err));
  }, []);

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleClickProduto = (id: string) => {
    navigate(`/editarmateriaprima/${id}`);
  };

  const materiasFiltradas = materias.filter((m) =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="layout-container-materia">
      <div className="nav">
        <NavBar />
      </div>

      <div className="menu">
        <MenuLateral />
      </div>

      <div className="produto-container-materia">
        <header className="header-materia">
          <div className="header-column">
            <img
              src={Voltar}
              alt="Voltar"
              className="voltar"
              onClick={handleVoltar}
            />
            <span>Cód</span>
          </div>

          <div className="nome-column">
            <span>Nome Produto</span>
          </div>

          <div className="valor-column">
            <span>Valor unidade</span>
          </div>

          <div className="data-column">
            <span>Data criação</span>
          </div>
        </header>

        <div className="tabela-materia">
          {/* Caixa de pesquisa */}
          <input
            type="text"
            placeholder="Buscar matéria-prima..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input-busca-lista"
          />
          <table>
            <tbody>
              {materiasFiltradas.map((materia, index) => (
                <tr key={index}>
                  <td className="codigo">{materia.codigo}</td>
                  <td className="nome-produto">{materia.nome}</td>
                  <td className="preco-materia">
                    R${" "}
                    {materia.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="data">
                    {new Date(materia.data).toLocaleDateString("pt-BR")}

                    <button
                      type="button"
                      className="editar-produto"
                      onClick={() => handleClickProduto(String(id))}
                    >
                      <img src={Editar} alt="Editar" className="icon-editar" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
