
import { NavLink, Link } from 'react-router-dom';

import './SimulacaoPedido.css';
import '../NavBar/NavBar.css'; // Importa os estilos do menu lateral

// Importe sua imagem de logo. Substitua o caminho abaixo pelo caminho real da sua imagem.
import Nome from '../../assets/logo.svg';

interface Material {
  nome: string;
  valor: number;
  quantidade: number;
  unidade: string;
}

export function SimulacaoPedido() {
  const materiais: Material[] = [
    { nome: 'Polietileno (PE)', valor: 8.00, quantidade: 1, unidade: 'kg' },
    { nome: 'Polipropileno (PP)', valor: 7.00, quantidade: 1, unidade: 'kg' },
    { nome: 'PVC', valor: 6.00, quantidade: 1, unidade: 'kg' },
    { nome: 'Aço Inoxidável', valor: 12.00, quantidade: 1, unidade: 'kg' },
    { nome: 'Alumínio', valor: 10.00, quantidade: 1, unidade: 'kg' },
    { nome: 'MDF', valor: 6.00, quantidade: 1, unidade: 'm²' },
    { nome: 'Poliéster', valor: 9.00, quantidade: 1, unidade: 'kg' },
  ];

  const total = materiais.reduce((acc, material) => acc + material.valor * material.quantidade, 0);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="layout-container">
      {/* Menu Lateral (NavBar) */}
      <section className="navbar">
        <nav>
          <div className="navBarDefault">
            <div className="left-side">
              <div className="nav-logo">
                <Link to="/">
                  <img src={Nome} alt="Logo" />
                </Link>
              </div>
            </div>

            <div className="right-side">
              <div className="nav-list">
                <ul className="navbar-nav">
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'navbar-link active' : 'navbar-link'
                    }
                    to={'/'}
                    end
                  >
                    <p className="parag">Início</p>
                  </NavLink>

                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'navbar-link active' : 'navbar-link'
                    }
                    to={'/produtos'}
                  >
                    <p className="parag">Produtos</p>
                  </NavLink>

                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'navbar-link active' : 'navbar-link'
                    }
                    to={'/materias-primas'}
                  >
                    <p className="parag">Matérias Primas</p>
                  </NavLink>
                </ul>
              </div>
            </div>
          </div>
          <div className="linha"></div>
        </nav>
      </section>

      {/* Conteúdo da Página de Simulação */}
      <div className="simulacao-container">
        {/* Cabeçalho */}
        <header className="simulacao-header">
          <div className="header-left">
            <span className="back-icon">&lt;</span>
            <p className="produto-nome">Nome Produto:</p>
            <p className="produto-valor">Produto BBC</p>
          </div>
          <div className="header-right">
            <p className="produto-codigo">Cód: 1001</p>
          </div>
        </header>

        {/* Tabela de Matérias-Primas */}
        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Matéria Prima</th>
                <th>Valor (R$)</th>
                <th>Quantidade</th>
                <th>Unidade medida</th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((material, index) => (
                <tr key={index}>
                  <td>{material.nome}</td>
                  <td>{formatarMoeda(material.valor)}</td>
                  <td>{material.quantidade}</td>
                  <td>{material.unidade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Rodapé da Tabela */}
          <div className="tabela-footer">
            <p className="total-text">
              Total: <span>{formatarMoeda(total)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}