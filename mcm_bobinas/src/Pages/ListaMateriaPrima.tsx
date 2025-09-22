import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "../Css/ListaMateriaPrima.css";
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

import Voltar from "../assets/seta.png";

type Materia = {
  codigo: number;
  nome: string;
  valor: number;
};

export function VisualizarMateriaPrima() {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState<Materia[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/materias")
      .then((res) => res.json())
      .then((data) => setMaterias(data))
      .catch((err) => console.error("Erro ao buscar matérias-primas:", err));
  }, []);

  const handleVoltar = () => {
    navigate(-1);
  };

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
            <span>Valor unidade atualizado</span>
          </div>
        </header>

        <div className="tabela-materia">
          <table>
            <tbody>
              {materias.map((materia, index) => (
                <tr key={index}>
                  <td className="codigo">{materia.codigo}</td>
                  <td className="link-produto">{materia.nome}</td>
                  <td className="preco">
                    R${" "}
                    {materia.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
