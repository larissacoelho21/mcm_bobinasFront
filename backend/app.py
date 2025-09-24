from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
from bs4 import BeautifulSoup
from pydantic import BaseModel
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Rota para receber produto e ficha técnica
@app.route('/api/produto', methods=['POST'])
def receber_produto():
    try:
        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()
        data = request.get_json()

        print("Payload recebido:", data)  # Log para debug

        nome = data.get('nomeProduto')
        codigo = data.get('codigoProduto')
        materias = data.get('materias')
        data_hoje = datetime.today().strftime('%d/%m/%Y')

        # Validação básica
        if not nome or not codigo or not materias:
            return jsonify({'status': 'erro', 'mensagem': 'Dados incompletos'}), 400

        # Inserir produto final
        cursor.execute("""
            INSERT OR REPLACE INTO produtos_finais (id, nome, criado_em)
            VALUES (?, ?, ?)
        """, (codigo, nome, data_hoje))

        # Inserir ficha técnica
        for m in materias:
            if not m.get('materiaPrima') or not m.get('unidade') or not m.get('quantidade') :
                return jsonify({'status': 'erro', 'mensagem': 'Matéria-prima incompleta'}), 400

            cursor.execute("""
                INSERT INTO fichas_tecnicas (produto_final_id, materia_prima_id, quantidade)
                VALUES (?, ?, ?)
            """, (
                codigo,
                m['materiaPrima'],
                float(m['quantidade'])  # Garantir tipo numérico
            ))

        conn.commit()
        return jsonify({'status': 'sucesso', 'mensagem': 'Produto recebido com sucesso!'})

    except Exception as e:
        print("ERRO:", e)
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500

    finally:
        conn.close()

# Rota para listar matérias-primas
@app.route('/api/materias', methods=['GET'])
def listar_materias():
    try:
        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()
        cursor.execute("SELECT codigo, descricao_produto, preco_unitario FROM materias_primas")
        dados = cursor.fetchall()
        materias =[{'codigo': row[0], 'nome': row[1], 'valor': row[2]} for row in dados]

        return jsonify(materias)
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500
    finally:
        conn.close()

# Rota para listar unidade de medida de uma matéria-prima
@app.route('/api/unidades/<codigo_materia>', methods=['GET'])
def listar_unidades_e_preco_por_materia(codigo_materia):
    try:
        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()
        cursor.execute("SELECT unidade, preco_unitario FROM materias_primas WHERE codigo = ?", (codigo_materia,))
        row = cursor.fetchone()

        if row:
            resultado = {
                'unidade': row[0],
                'preco_unitario': row[1]
            }
            return jsonify(resultado)
        else:
            return jsonify({'erro': 'Matéria-prima não encontrada'}), 404
    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    finally:
        conn.close()

# Rota para listar produtos com preço total calculado
@app.route('/api/produtos-com-preco', methods=['GET'])
def listar_produtos_com_preco():
    try:
        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                pf.id,
                pf.nome,
                pf.criado_em,
                SUM(ft.quantidade * mp.preco_unitario) AS preco_total
            FROM produtos_finais pf
            JOIN fichas_tecnicas ft ON pf.id = ft.produto_final_id
            JOIN materias_primas mp ON ft.materia_prima_id = mp.codigo
            GROUP BY pf.id, pf.nome, pf.criado_em
        """)
        dados = cursor.fetchall()
        produtos = [
            {
                'id': row[0],
                'nome': row[1],
                'criado_em': row[2],
                'preco_total': round(row[3], 2) if row[3] is not None else 0.0
            }
            for row in dados
        ]
        return jsonify(produtos)
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500
    finally:
        conn.close()



@app.route('/api/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400

    filename = file.filename.lower()

    if filename.endswith('.pdf'):
        import pdfplumber
        import re
        from io import BytesIO
        import sqlite3

        conteudo_pdf = BytesIO(file.read())

        with pdfplumber.open(conteudo_pdf) as pdf:
            primeira_pagina = pdf.pages[0]

            # Emitente
            area_emitente = (60, 30, 380, 50)
            bloco = primeira_pagina.crop(area_emitente)
            texto_emitente = bloco.extract_text() or "Emitente não identificado"

            # Data de emissão
            texto_completo = primeira_pagina.extract_text()
            padrao_data = r'\b(?:DATA DA EMISS[ÃA]O)?\s*[:\-]?\s*(\d{2}/\d{2}/\d{4})\b'
            match = re.search(padrao_data, texto_completo)
            data_emissao = match.group(1) if match else "Data não encontrada"

            # Conexão com banco
            conn = sqlite3.connect("produtos.db")
            cursor = conn.cursor()

            for pagina in pdf.pages:
                tabelas = pagina.extract_tables()
                for tabela in tabelas:
                    for linha in tabela:
                        if not linha or not any(linha):
                            continue

                        if len(linha) >= 9 and linha[1] and linha[7] and linha[8]:
                            if "DESCRIÇÃO DO PRODUTO" in linha[1].upper():
                                continue

                            codigos = linha[0].split("\n") if linha[0] else []
                            descricoes = linha[1].split("\n") if linha[1] else []
                            quantidades = linha[6].split("\n") if linha[6] else []
                            valores_unit = linha[7].split("\n") if linha[7] else []
                            valores_total = linha[8].split("\n") if linha[8] else []

                            total_itens = max(len(descricoes), len(valores_unit))

                            for i in range(total_itens):
                                codigo = codigos[i] if i < len(codigos) else ""
                                descricao = descricoes[i] if i < len(descricoes) else "Produto não identificado"
                                quantidade = quantidades[i] if i < len(quantidades) else "1"
                                valor_unit = valores_unit[i] if i < len(valores_unit) else "0,00"

                                try:
                                    preco_unitario = float(valor_unit.replace(".", "").replace(",", "."))
                                    qtd = float(quantidade.replace(",", "."))
                                except:
                                    preco_unitario = 0.0
                                    qtd = 1.0

                                try:
                                    cursor.execute("""
                                        INSERT INTO historico (
                                            codigo, descricao_fornecedor, descricao_produto,
                                            unidade, quantidade, preco_unitario, emissao
                                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                                    """, (
                                        codigo.strip(),
                                        texto_emitente,
                                        descricao.strip(),
                                        "UN",
                                        qtd,
                                        preco_unitario,
                                        data_emissao
                                    ))
                                except Exception:
                                    continue

            conn.commit()
            conn.close()

        return jsonify({
            'message': 'PDF processado e salvo com sucesso!',
            'filename': filename,
            'emissao': data_emissao,
            'fornecedor': texto_emitente
        })

    elif filename.endswith('.xml'):
        from bs4 import BeautifulSoup
        from datetime import datetime
        import sqlite3

        conteudo = file.read().decode('utf-8')
        soup = BeautifulSoup(conteudo, "xml")

        raw_emissao = soup.find("dhEmi").text if soup.find("dhEmi") else ""
        fornecedor = soup.find("xNome").text if soup.find("xNome") else ""

        try:
            emissao = datetime.fromisoformat(raw_emissao).strftime("%d/%m/%Y")
        except ValueError:
            partes = raw_emissao[:10].split("-")
            emissao = f"{partes[2]}/{partes[1]}/{partes[0]}"

        conn = sqlite3.connect("produtos.db")
        cursor = conn.cursor()

        for det in soup.find_all("det"):
            codigo = det.find("cProd").text if det.find("cProd") else ""
            nome_produto = det.find("xProd").text if det.find("xProd") else ""
            unidade = det.find("uCom").text if det.find("uCom") else ""
            quantidade = det.find("qCom").text if det.find("qCom") else "0"
            preco_unitario = det.find("vUnCom").text if det.find("vUnCom") else "0"

            try:
                cursor.execute("""
                    INSERT INTO historico (
                        codigo, descricao_fornecedor, descricao_produto,
                        unidade, quantidade, preco_unitario, emissao
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    codigo,
                    fornecedor,
                    nome_produto,
                    unidade,
                    float(quantidade),
                    float(preco_unitario),
                    emissao
                ))
            except Exception:
                continue

        conn.commit()
        conn.close()

        return jsonify({
            'message': 'XML processado e salvo com sucesso!',
            'filename': filename,
            'emissao': emissao,
            'fornecedor': fornecedor
        })

    else:
        return jsonify({'error': 'Tipo de arquivo não permitido. Apenas PDF ou XML.'}), 400


@app.route('/api/produto/<id>', methods=['GET'])
def visualizar_produto(id):
    try:
        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()

        # Buscar nome do produto
        cursor.execute("SELECT id, nome FROM produtos_finais WHERE id = ?", (id,))
        produto = cursor.fetchone()
        if not produto:
            return jsonify({'status': 'erro', 'mensagem': 'Produto não encontrado'}), 404

        produto_id, produto_nome = produto

        # Buscar matérias-primas ligadas ao produto
        cursor.execute("""
            SELECT 
                mp.descricao_produto AS nome,
                mp.preco_unitario AS valor,
                ft.quantidade,
                mp.unidade
            FROM fichas_tecnicas ft
            JOIN materias_primas mp ON ft.materia_prima_id = mp.codigo
            WHERE ft.produto_final_id = ?
        """, (produto_id,))
        materiais = cursor.fetchall()

        lista_materiais = [
            {
                'nome': row[0],
                'valor': round(row[1], 2),
                'quantidade': row[2],
                'unidade': row[3]
            }
            for row in materiais
        ]

        total = sum(m['valor'] * m['quantidade'] for m in lista_materiais)

        return jsonify({
            'id': produto_id,
            'nome': produto_nome,
            'materiais': lista_materiais,
            'total': round(total, 2)
        })

    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500
    finally:
        conn.close()

class Produto(BaseModel):
    cod: str
    descricao: str
    unid: str
    qtd: float
    vlrUnit: float
    fornecedor: str  # campo extra do formulário
    emissao: str  

@app.post("/inserir-nota")
async def inserir_nota(produto: Produto):
    conn = sqlite3.connect("notas.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO historico (
            codigo,
            descricao_fornecedor,
            descricao_produto,
            unidade,
            quantidade,
            preco_unitario,
            emissao
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        produto.cod,
        produto.fornecedor,
        produto.descricao,
        produto.unid,
        produto.qtd,
        produto.vlrUnit,
        produto.emissao or datetime.now().isoformat()
    ))

    conn.commit()
    conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)


