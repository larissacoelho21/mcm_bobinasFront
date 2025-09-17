import React, { useState } from "react";

import "../Css/AddProduto.css"
import { NavBar } from "../Components/NavBar/NavBar";
import { MenuLateral } from "../Components/Menu Lateral/MenuLateral";

type MateriaPrima = {
  id: number;
  nome: string;
};

type CampoMateriaPrima = {
  materiaPrima: string;
  unidadeMedida: string;
  quantidade: string;
};
 
export function AdicionarProduto() {
  const [nomeProduto, setNomeProduto] = useState("");
  const [codigoProduto, setCodigoProduto] = useState("");
  const [materias, setMaterias] = useState<CampoMateriaPrima[]>([
    { materiaPrima: "", unidadeMedida: "", quantidade: "" },
  ]);
 
  // Exemplo de opções fixas (você pode puxar da API depois)
  const materiasPrimas: MateriaPrima[] = [
    { id: 1, nome: "Açúcar" },
    { id: 2, nome: "Farinha" },
    { id: 3, nome: "Óleo" },
  ];

  const unidadesMedida = ["Kg", "g", "L", "ml", "unidade"];

  const handleAddCampo = () => {
    setMaterias([...materias, { materiaPrima: "", unidadeMedida: "", quantidade: "" }]);
  };

  const handleChange = (index: number, field: keyof CampoMateriaPrima, value: string) => {
    const newMaterias = [...materias];
    newMaterias[index][field] = value;
    setMaterias(newMaterias);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      nomeProduto,
      codigoProduto,
      materias,
    };
    console.log("Dados enviados:", data);
    // Aqui você conecta com sua API (axios/fetch)
  }; 

  return (
    <section className="container">
        <div className="nav">
            <NavBar/>
        </div>

        <div className="menu">
            <MenuLateral/>
        </div>

        <div className="Container" >
            <div className="title">
                <h2>Adicionar produto</h2>
            </div>

            <form onSubmit={handleSubmit} className="form">
                <input
                type="text"
                placeholder="Nome do produto"
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
                className="input"
                />

                <input
                type="text"
                placeholder="Código do produto"
                value={codigoProduto}
                onChange={(e) => setCodigoProduto(e.target.value)}
                className="input"
                />

                <label className="label">Matéria prima utilizada:</label>

                {materias.map((campo, index) => (
                <div key={index} className="campo-materia">
                    <select
                    value={campo.materiaPrima}
                    onChange={(e) => handleChange(index, "materiaPrima", e.target.value)}
                    className="select"
                    >
                    <option value="">Selecione a matéria prima</option>
                    {materiasPrimas.map((m) => (
                        <option key={m.id} value={m.nome}>
                        {m.nome}
                        </option>
                    ))}
                    </select>

                    <select
                    value={campo.unidadeMedida}
                    onChange={(e) => handleChange(index, "unidadeMedida", e.target.value)}
                    className="select"
                    >
                    <option value="">Unidade de medida</option>
                    {unidadesMedida.map((u, i) => (
                        <option key={i} value={u}>
                        {u}
                        </option>
                    ))}
                    </select>

                    <input
                    type="number"
                    placeholder="Quantidade"
                    value={campo.quantidade}
                    onChange={(e) => handleChange(index, "quantidade", e.target.value)}
                    className="number-input"
                    />
                </div>
                ))}

                <button type="button" onClick={handleAddCampo} className="add-button">
                + Adicionar campo
                </button>

                <button type="submit" className="submit-button">
                Adicionar
                </button>
            </form>
        </div> 
    </section>
  );
};

