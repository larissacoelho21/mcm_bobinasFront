from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
from bs4 import BeautifulSoup
from pydantic import BaseModel
import re
from io import BytesIO
import unicodedata
from difflib import SequenceMatcher
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

        # Agora basta selecionar da view
        cursor.execute("""
            SELECT codigo,
                   descricao_produto,
                   preco_unitario,
                   emissao,
                   emissao_iso
            FROM materias_primas
        """)

        dados = cursor.fetchall()
        materias = [
            {
                'codigo': row[0],
                'nome': row[1],
                'valor': row[2],
                'data_original': row[3],  # emissao no formato DD/MM/YYYY
                'data': row[4]            # emissao_iso no formato YYYY-MM-DD
            }
            for row in dados
        ]

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
@app.route('/api/materias/<codigo_materia>', methods=['GET'])
def buscar_materia_por_codigo(codigo_materia):
    try:
        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()
        # Ajuste as colunas à sua tabela real. Exemplo abaixo:
        cursor.execute("""
            SELECT
                codigo,                         -- código real
                descricao_produto AS nome,      -- alias p/ "nome" no JSON
                unidade AS unidade,             -- alias estável
                preco_unitario AS preco_unitario,
                emissao AS data                 -- alias p/ data
            FROM materias_primas
            WHERE codigo = ?
        """, (codigo_materia,))
        row = cursor.fetchone()

        if row:
            resultado = {
                'codigo': row[0],
                'nome': row[1],
                'unidade': row[2],
                'preco_unitario': row[3],
                'data': row[4]
            }
            return jsonify(resultado)
        else:
            return jsonify({'erro': 'Matéria-prima não encontrada'}), 404
    except Exception as e:
        print("Erro em /api/materias/<codigo>:", e)
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
            ORDER BY pf.criado_em DESC
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



    
    def limpar_texto(s):
        s = s or ""
        s = s.strip()
        if '-' in s:
            s = s.split('-', 1)[1]
        s = s.strip()
        s = re.sub(r'\s+', ' ', s)
        return s

    def normalizar_busca(s):
        s = (s or "").lower().strip()
        s = re.sub(r'[^a-z0-9x.\sçãõéêáíú-]', ' ', s)
        s = re.sub(r'\s+', ' ', s)
        return s

    def normalizar_nome(s):
        s = (s or "").lower()
        s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
        s = re.sub(r'[\(\)\-\/.,]', ' ', s)
        s = re.sub(r'\b(metalgrafite|de|para|com)\b', '', s)
        s = re.sub(r'\s+', ' ', s).strip()
        return s

    def parse_num(s, default=None):
        if not s:
            return default
        s = s.strip()
        if "," in s and "." in s and s.rfind(",") > s.rfind("."):
            s = s.replace(".", "").replace(",", ".")
        elif "," in s:
            s = s.replace(",", ".")
        try:
            return float(s)
        except ValueError:
            
            return default

    def extract_dim_key(s):
        sn = normalizar_busca(s)
        m = re.search(r'(\d+(?:\.\d+)?)\s*[x]\s*(\d+(?:\.\d+)?)', sn)
        if m:
            return f"{m.group(1)}x{m.group(2)}"
        return None
    
    def detectar_unidade(descricao, unidade_extra=None):
        desc = descricao.lower()

        # Se já veio unidade da tabela, prioriza ela
        if unidade_extra and unidade_extra.strip():
            return unidade_extra.strip().upper()

        # Heurísticas pela descrição
        if "kg" in desc:
            return "KG"
        if "pc" in desc or "peça" in desc:
            return "PC"
        if "mt" in desc or "metro" in desc:
            return "MT"
        if "cx" in desc or "caixa" in desc:
            return "CX"
        if "l" in desc or "litro" in desc:
            return "L"

        # fallback
        return "UN"

    def prefixo_semelhanca(s):
        palavras = normalizar_busca(s).split()
        if not palavras:
            return ""
        if palavras[0] == "fio" and "esmaltado" in palavras:
            idx = palavras.index("esmaltado")
            if idx + 2 < len(palavras):
                return " ".join(palavras[idx:idx+3])
            return " ".join(palavras[idx:])
        return " ".join(palavras[:3])
    
    def buscar_valor_por_palavra_chave(descricao, texto_pdf):
       # procura linhas que contenham a descrição e "VLR UNIT" ou "V. UNITÁRIO"
        for linha in texto_pdf.splitlines():
            if descricao[:10].upper() in linha.upper() and ("VLR UNIT" in linha.upper() or "V. UNIT" in linha.upper()):
                numeros = re.findall(r"\d+[\.,]\d{2}", linha)
                if numeros:
                    return parse_num(numeros[-1])
        return None
    def extrair_trecho_produtos(texto_pdf: str) -> str:
        """
        Retorna apenas o trecho entre 'DADOS DO PRODUTO/SERVIÇO'
        e 'CÁLCULO DO ISSQN', se existir.
        Caso contrário, retorna o texto inteiro.
        """
        start = texto_pdf.find("DADOS DO PRODUTO/SERVIÇO")
        end = texto_pdf.find("CÁLCULO DO ISSQN")

        if start != -1 and end != -1 and end > start:
            return texto_pdf[start:end]
        return texto_pdf

    PALAVRAS_EXCLUIR = [
    "TRIBUTO", "MUNICIPAIS", "TOTAL", "ICMS", "IPI", "PIS", "COFINS", "ISS",
    "SEGURO", "FRETE", "DESCONTO", "APROXIMADO", "IMPOSTO"
]

    def extrair_itens_modelo_colunas(pagina):
        """
        Extrai todos os itens da tabela da página inteira.
        Retorna lista de dicts com codigo, descricao, quantidade, valor_unitario, valor_total.
        """
        itens = []
        tables = pagina.extract_tables()
        for table in tables:
            if not table or len(table[0]) < 9:
                continue

            codigos = (table[0] or [])
            descricoes = (table[1] or [])
            quantidades = (table[6] or [])
            valores_unit = (table[7] or [])
            valores_totais = (table[8] or [])

            total_itens = max(len(codigos), len(descricoes), len(quantidades), len(valores_unit), len(valores_totais))

            for i in range(total_itens):
                codigo = (codigos[i] or "").strip() if i < len(codigos) else ""
                descricao = (descricoes[i] or "").strip() if i < len(descricoes) else ""
                qtd = parse_num(quantidades[i]) if i < len(quantidades) else None
                vunit = parse_num(valores_unit[i]) if i < len(valores_unit) else None
                vtotal = parse_num(valores_totais[i]) if i < len(valores_totais) else None

                if not codigo or not descricao:
                    continue
                if any(p in descricao.upper() for p in PALAVRAS_EXCLUIR):
                    continue
                if qtd is None or vunit is None:
                    continue

                itens.append({
                    "codigo": codigo,
                    "descricao": descricao,
                    "quantidade": qtd,
                    "valor_unitario": vunit,
                    "valor_total": vtotal
                })
        return itens



    def buscar_valor_por_regex(descricao, texto_pdf):
        """
        Procura padrão de número logo após a descrição usando regex.
        """
        if not descricao:
            return None

        partes = descricao.split()
        if not partes:
            return None

        padrao = re.escape(partes[0]) + r".*?(\d+[\.,]\d{2})"
        match = re.search(padrao, texto_pdf, re.IGNORECASE)
        if match:
            return parse_num(match.group(1))

        return None
  
    def similaridade(a, b):
        return SequenceMatcher(None, a, b).ratio()

    def casar_produto(descricao_origem, preco_origem, cursor):
        desc_norm = normalizar_nome(descricao_origem)

        if "escova" not in desc_norm:
            return None

        # Extrair modelo
        m = re.search(r'([a-z]{1,3}[\s-]?\d{2,4}[a-z]?)', desc_norm)
        modelo = m.group(1).replace(" ", "").replace("-", "").lower() if m else ""

        # Extrair tensão
        m2 = re.search(r'(\d{2}(?:/\d{2})?)\s*v', desc_norm)
        tensao = m2.group(1).lower() + "v" if m2 else ""

        # Caso 1: modelo + tensão
        if modelo and tensao:
            cursor.execute("""
                SELECT codigo, descricao_produto, unidade, preco_unitario
                FROM historico
                WHERE LOWER(descricao_produto) LIKE ?
                AND LOWER(descricao_produto) LIKE ?
                AND LOWER(descricao_produto) LIKE '%escova%'
                LIMIT 1
            """, (f"%{modelo}%", f"%{tensao}%"))
            achado = cursor.fetchone()
            if achado:
                return achado[0], achado[1], achado[2]

        # Caso 2: tensão + similaridade + preço
        if tensao:
            cursor.execute("""
                SELECT codigo, descricao_produto, unidade, preco_unitario
                FROM historico
                WHERE LOWER(descricao_produto) LIKE ?
                AND LOWER(descricao_produto) LIKE '%escova%'
            """, (f"%{tensao}%",))
            candidatos = cursor.fetchall()
            if candidatos:
                melhor = None
                melhor_score = 0
                for c in candidatos:
                    desc_banco = normalizar_nome(c[1])
                    score = similaridade(desc_norm, desc_banco)
                    if score > melhor_score:
                        melhor = c
                        melhor_score = score
                    elif score == melhor_score and preco_origem is not None:
                        if abs((c[3] or 0) - preco_origem) < abs((melhor[3] or 0) - preco_origem):
                            melhor = c
                if melhor:
                    return melhor[0], melhor[1], melhor[2]

        return None
    def obter_codigo_banco(cursor, descricao):
        # Busca código canônico pela descrição (case-insensitive)
        cursor.execute("""
            SELECT codigo
            FROM materias_primas
            WHERE UPPER(TRIM(descricao_produto)) = UPPER(TRIM(?))
            ORDER BY codigo ASC
            LIMIT 1
        """, (descricao,))
        r = cursor.fetchone()
        return r[0] if r else None
    conn = sqlite3.connect("produtos.db")
    cursor = conn.cursor()
    avisos = []
    if filename.endswith('.pdf'):
        import pdfplumber

        conteudo_pdf = BytesIO(file.read())
        with pdfplumber.open(conteudo_pdf) as pdf:
            primeira_pagina = pdf.pages[0]

            # 🔽 pega o texto bruto de todas as páginas para os fallbacks
            texto_pdf = "\n".join(page.extract_text() or "" for page in pdf.pages)

            area_emitente = (60, 30, 380, 50)
            bloco = primeira_pagina.crop(area_emitente)
            texto_emitente = limpar_texto(bloco.extract_text() or "Emitente não identificado")

            texto_completo = primeira_pagina.extract_text() or ""
            padrao_data = r'\b(?:DATA DA EMISS[ÃA]O)?\s*[:\-]?\s*(\d{2}/\d{2}/\d{4})\b'
            match = re.search(padrao_data, texto_completo, flags=re.IGNORECASE)
            data_emissao = match.group(1) if match else "Data não encontrada"


            processando_itens = False
            
            for pagina in pdf.pages:
                tabelas = pagina.extract_tables() or []
                for tabela in tabelas:
                    for linha in tabela:
                        if not linha or not any(linha):
                            continue

                        while len(linha) < 9:
                            linha.append("")

                        cabecalho = (linha[1] or "").upper()
                        if "DESCRIÇÃO DO PRODUTO" in cabecalho or "CÓDIGO PRODUTO" in cabecalho:
                            processando_itens = True
                            continue

                        if not processando_itens:
                            continue

                       # Quebra colunas da linha
                        codigos = linha[0].split("\n") if linha[0] else [""]
                        descricoes = linha[1].split("\n") if linha[1] else [""]
                        quantidades = linha[6].split("\n") if linha[6] else [""]
                        valores_unit = linha[7].split("\n") if linha[7] else [""]
                        unidades = linha[5].split("\n") if len(linha) > 5 and linha[5] else [""]

                        total_itens = max(len(descricoes), len(valores_unit), len(codigos), len(quantidades), len(unidades))
                        if "MCM BOBINAS" in texto_emitente.upper():
                            itens = extrair_itens_modelo_colunas(primeira_pagina)
                            for item in itens:
                                # aqui você já tem todos os campos
                                codigo_pdf = item["codigo"]
                                descricao_pdf = item["descricao"]
                                qtd = item["quantidade"]
                                valor_unit = item["valor_unitario"]
                                valor_total = item["valor_total"]

                        else:
                            for i in range(total_itens):
                                preco_unitario = None  # 👈 PASSO 1: inicializa aqui

                                codigo_pdf = codigos[i].strip() if i < len(codigos) else ""
                                descricao_pdf = limpar_texto(descricoes[i]) if i < len(descricoes) else ""
                                qtd = parse_num(quantidades[i]) if i < len(quantidades) else 0.0
                                qtd = qtd or 0.0

                                candidatos = []
                                c1 = parse_num(valores_unit[i]) if i < len(valores_unit) else None
                                if c1 is not None:
                                    candidatos.append(("tabela", c1))

                                c2 = buscar_valor_por_palavra_chave(descricao_pdf, texto_pdf)
                                if c2 is not None:
                                    candidatos.append(("palavra-chave", c2))

                                c3 = buscar_valor_por_regex(descricao_pdf, texto_pdf)
                                if c3 is not None:
                                    candidatos.append(("regex", c3))

                                if candidatos:
                                    metodo, preco_unitario = candidatos[0]
                                    print(f"[INFO] Preço extraído pelo método {metodo}: {preco_unitario}")
                                else:
                                    print(f"[IGNORADO] Não foi possível extrair preço unitário para: {descricao_pdf}")
                                    continue

                                desc_norm = normalizar_busca(descricao_pdf)

                                # Ajuste especial para "asa"
                                if preco_unitario is not None and "asa" in desc_norm:
                                    preco_unitario = preco_unitario / 18
                                elif preco_unitario is not None and "100m" in desc_norm:
                                    preco_unitario = preco_unitario / 100
                                    
                                elif preco_unitario is not None and "65m" in desc_norm:
                                    preco_unitario = preco_unitario / 65

                            desc_norm = normalizar_busca(descricao_pdf)

                            # Ajuste especial para "asa"
                            if "asa" in desc_norm:
                                preco_unitario = preco_unitario / 18

                            # Detecta unidade
                            unidade_extra = unidades[i].strip() if i < len(unidades) else ""
                            unidade_final = detectar_unidade(descricao_pdf, unidade_extra)

                            codigo_final, descricao_final = None, None

                            # Verifica divergência já resolvida
                            cursor.execute("""
                                SELECT nome_corrigido
                                FROM divergencias
                                WHERE descricao_origem = ?
                                AND nome_corrigido IS NOT NULL
                                ORDER BY id DESC
                                LIMIT 1
                            """, (descricao_pdf,))
                            row = cursor.fetchone()

                            if row:
                                nome_corrigido = row[0]
                                achado = casar_produto(nome_corrigido, preco_unitario, cursor)
                            else:
                                achado = casar_produto(descricao_pdf, preco_unitario, cursor)

                            if achado:
                                codigo_final, descricao_final, unidade_final = achado

                            # Tentativas adicionais de casamento no histórico
                            if not codigo_final:
                                dim_key = extract_dim_key(descricao_pdf)
                                if dim_key and "canto quadrado" in desc_norm:
                                    cursor.execute("""
                                        SELECT codigo, descricao_produto, unidade
                                        FROM historico
                                        WHERE LOWER(descricao_produto) LIKE ?
                                        AND LOWER(descricao_produto) LIKE '%canto quadrado%'
                                        ORDER BY ROWID ASC
                                        LIMIT 1
                                    """, (f"%{dim_key}%",))
                                    achado = cursor.fetchone()
                                    if achado:
                                        codigo_final, descricao_final, unidade_final = achado

                            if not codigo_final:
                                prefixo = prefixo_semelhanca(descricao_pdf)
                                if prefixo:
                                    cursor.execute("""
                                        SELECT codigo, descricao_produto, unidade
                                        FROM historico
                                        WHERE LOWER(descricao_produto) LIKE ?
                                        ORDER BY ROWID ASC
                                        LIMIT 1
                                    """, (prefixo + '%',))
                                    achado = cursor.fetchone()
                                    if achado:
                                        codigo_final, descricao_final, unidade_final = achado

                            if not codigo_final:
                                descricao_busca = normalizar_busca(descricao_pdf)
                                cursor.execute("""
                                    SELECT codigo, descricao_produto, unidade
                                    FROM historico
                                    WHERE LOWER(REPLACE(descricao_produto, '-', '')) LIKE ?
                                    ORDER BY ROWID ASC
                                    LIMIT 1
                                """, (f"%{descricao_busca}%",))
                                achado = cursor.fetchone()
                                if achado:
                                    codigo_final, descricao_final, unidade_final = achado

                            if not codigo_final and "asa" in desc_norm:
                                cursor.execute("""
                                    SELECT codigo, descricao_produto, unidade
                                    FROM historico
                                    WHERE LOWER(descricao_produto) LIKE ?
                                    ORDER BY ROWID ASC
                                    LIMIT 1
                                """, (f"%{desc_norm}%",))
                                achado = cursor.fetchone()
                                if achado:
                                    codigo_final, descricao_final, unidade_final = achado
                            
                            # 🔽 Lógica de divergências (corrigida)
                            if not codigo_final:
                                cursor.execute("""
                                    SELECT nome_corrigido, resolvido
                                    FROM divergencias
                                    WHERE descricao_origem = ?
                                    ORDER BY id DESC
                                    LIMIT 1
                                """, (descricao_pdf,))
                                row = cursor.fetchone()
                                nome_corrigido = row[0] if row else None
                                resolvido = row[1] if row else 0

                                if row and resolvido == 2:
                                    # divergência marcada como ignorar → não insere no histórico
                                    print(f"[IGNORADO] {descricao_pdf} marcado como resolvido=2 (ignorar)")
                                    continue

                                if row and nome_corrigido and resolvido == 1:
                                    # divergência resolvida → usa nome corrigido
                                    descricao_final = nome_corrigido
                                    codigo_db = obter_codigo_banco(cursor, descricao_final)
                                    codigo_final = codigo_db if codigo_db else codigo_pdf

                                elif row and not nome_corrigido:
                                    # divergência pendente → insere mesmo assim com nome original
                                    print(f"[DIVERGÊNCIA PENDENTE] {descricao_pdf} será inserido no histórico")
                                    descricao_final = descricao_pdf
                                    codigo_db = obter_codigo_banco(cursor, descricao_final)
                                    codigo_final = codigo_db if codigo_db else codigo_pdf

                                else:
                                    # não existe divergência → cria nova e insere
                                    cursor.execute("""
                                        INSERT INTO divergencias (descricao_origem, preco_origem, fonte, data)
                                        VALUES (?, ?, ?, ?)
                                    """, (descricao_pdf, preco_unitario, texto_emitente, data_emissao))
                                    print(f"[DIVERGÊNCIA NOVA] {descricao_pdf} adicionada para análise")
                                    descricao_final = descricao_pdf
                                    avisos.append(f"Divergência nova: {descricao_pdf} verificação necessária (SE FOR UM PRODUTO NOVO DESCONSIDERE)")
                                    codigo_db = obter_codigo_banco(cursor, descricao_final)
                                    codigo_final = codigo_db if codigo_db else codigo_pdf

                            # Inserção no histórico
                            print(f"[INSERINDO PDF] codigo={codigo_final} | nome='{descricao_final}' | unidade={unidade_final} | qtd={qtd} | preco={preco_unitario} | data={data_emissao}")
                            if qtd <= 0:
                                print(f"[IGNORADO] Item com quantidade inválida: {descricao_pdf} ({qtd})")
                                continue

                            cursor.execute("""
                                INSERT INTO historico (
                                    codigo, descricao_fornecedor, descricao_produto,
                                    unidade, quantidade, preco_unitario, emissao
                                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                            """, (
                                codigo_final,
                                texto_emitente,
                                descricao_final,
                                unidade_final,
                                qtd,
                                preco_unitario,
                                data_emissao
                            ))


            conn.commit()
            conn.close()


            return jsonify({
                                    'message': 'PDF processado e salvo com sucesso!',
                                    'avisos': avisos,
                                    'filename': filename,
                                    'emissao': data_emissao,
                
                                })

    elif filename.endswith('.xml'):
            conteudo = file.read().decode('utf-8')
            soup = BeautifulSoup(conteudo, "xml")

            raw_emissao = soup.find("dhEmi").text if soup.find("dhEmi") else ""
            fornecedor = soup.find("xNome").text if soup.find("xNome") else ""

            try:
                emissao = datetime.fromisoformat(raw_emissao).strftime("%d/%m/%Y")
            except ValueError:
                partes = raw_emissao[:10].split("-")
                emissao = f"{partes[2]}/{partes[1]}/{partes[0]}"

            for det in soup.find_all("det"):
                codigo_xml = det.find("cProd").text if det.find("cProd") else ""
                nome_xml = limpar_texto(det.find("xProd").text) if det.find("xProd") else ""
                unidade_xml = det.find("uCom").text if det.find("uCom") else ""
                quantidade = parse_num(det.find("qCom").text) if det.find("qCom") else 0.0
                preco_unitario = parse_num(det.find("vUnCom").text.replace(".", ",")) if det.find("vUnCom") else 0.0
                desc_norm = normalizar_busca(nome_xml)

                if "asa" in desc_norm:
                    preco_unitario = preco_unitario / 18

                codigo_final, descricao_final, unidade_final = None, None, "UN"

                # Verifica se já existe divergência com nome corrigido
                cursor.execute("""
                    SELECT nome_corrigido
                    FROM divergencias
                    WHERE descricao_origem = ?
                    AND nome_corrigido IS NOT NULL
                    ORDER BY id DESC
                    LIMIT 1
                """, (nome_xml,))
                row = cursor.fetchone()

                if row:
                    nome_corrigido = row[0]
                    achado = casar_produto(nome_corrigido, preco_unitario, cursor)
                else:
                    achado = casar_produto(nome_xml, preco_unitario, cursor)

                if achado:
                    codigo_final, descricao_final, unidade_final = achado

                if not codigo_final:
                    dim_key = extract_dim_key(nome_xml)
                    if dim_key and "canto quadrado" in desc_norm:
                        cursor.execute("""
                            SELECT codigo, descricao_produto, unidade
                            FROM historico
                            WHERE LOWER(descricao_produto) LIKE ?
                            AND LOWER(descricao_produto) LIKE '%canto quadrado%'
                            ORDER BY ROWID ASC
                            LIMIT 1
                        """, (f"%{dim_key}%",))
                        achado = cursor.fetchone()
                        if achado:
                            codigo_final, descricao_final, unidade_final = achado

                if not codigo_final:
                    prefixo = prefixo_semelhanca(nome_xml)
                    if prefixo:
                        cursor.execute("""
                            SELECT codigo, descricao_produto, unidade
                            FROM historico
                            WHERE LOWER(descricao_produto) LIKE ?
                            ORDER BY ROWID ASC
                            LIMIT 1
                        """, (prefixo + '%',))
                        achado = cursor.fetchone()
                        if achado:
                            codigo_final, descricao_final, unidade_final = achado

                if not codigo_final:
                    descricao_busca = normalizar_busca(nome_xml)
                    cursor.execute("""
                        SELECT codigo, descricao_produto, unidade
                        FROM historico
                        WHERE LOWER(REPLACE(descricao_produto, '-', '')) LIKE ?
                        ORDER BY ROWID ASC
                        LIMIT 1
                    """, (f"%{descricao_busca}%",))
                    achado = cursor.fetchone()
                    if achado:
                        codigo_final, descricao_final, unidade_final = achado

                if not codigo_final and "asa" in desc_norm:
                    cursor.execute("""
                        SELECT codigo, descricao_produto, unidade
                        FROM historico
                        WHERE LOWER(descricao_produto) LIKE ?
                        ORDER BY ROWID ASC
                        LIMIT 1
                    """, (f"%{desc_norm}%",))
                    achado = cursor.fetchone()
                    if achado:
                        codigo_final, descricao_final, unidade_final = achado
                # 🔽 Lógica de divergências (XML)
                if not codigo_final:
                    cursor.execute("""
                        SELECT nome_corrigido
                        FROM divergencias
                        WHERE descricao_origem = ?
                        ORDER BY id DESC
                        LIMIT 1
                    """, (nome_xml,))
                    row = cursor.fetchone()
                    nome_corrigido = row[0] if row else None

                    if row and nome_corrigido:
                        # divergência resolvida → usa nome corrigido
                        descricao_final = nome_corrigido
                        codigo_db = obter_codigo_banco(cursor, descricao_final)
                        codigo_final = codigo_db if codigo_db else codigo_xml
                        unidade_final = unidade_xml.strip().upper() if unidade_xml else "UN"

                    elif row and not nome_corrigido:
                        # divergência pendente → insere mesmo assim
                        print(f"[DIVERGÊNCIA PENDENTE] {nome_xml} será inserido no histórico")
                        descricao_final = nome_xml
                        codigo_db = obter_codigo_banco(cursor, descricao_final)
                        codigo_final = codigo_db if codigo_db else codigo_xml
                        unidade_final = unidade_xml.strip().upper() if unidade_xml else "UN"

                    else:
                        # não existe divergência → cria nova e insere no historico
                        cursor.execute("""
                            INSERT INTO divergencias (descricao_origem, preco_origem, fonte, data)
                            VALUES (?, ?, ?, ?)
                        """, (nome_xml, preco_unitario, fornecedor, emissao))
                        print(f"[DIVERGÊNCIA NOVA] {nome_xml} adicionada para análise")
                        avisos.append(f"Divergência nova: {nome_xml} verificação necessária (SE FOR UM PRODUTO NOVO DESCONSIDERE)")
                        descricao_final = nome_xml
                        codigo_db = obter_codigo_banco(cursor, descricao_final)
                        codigo_final = codigo_db if codigo_db else codigo_xml
                        unidade_final = unidade_xml.strip().upper() if unidade_xml else "UN"


                # Se chegou aqui, é porque já tem nome válido (historico ou divergência resolvida)
                print(f"[INSERINDO XML] codigo={codigo_final} | nome='{descricao_final}' | unidade={unidade_final} | qtd={quantidade} | preco={preco_unitario} | data={emissao}")

                cursor.execute("""
                    INSERT INTO historico (
                        codigo, descricao_fornecedor, descricao_produto,
                        unidade, quantidade, preco_unitario, emissao
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    codigo_final,
                    fornecedor,
                    descricao_final,
                    unidade_final,
                    quantidade,
                    preco_unitario,
                    emissao
                ))


            conn.commit()
            conn.close()


            return jsonify({
                'message': 'XML processado e salvo com sucesso!',
                'filename': filename,
                'emissao': emissao,
                'avisos': avisos,
            })


    # --- Outros formatos ---
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



# Atualizar produto
@app.route('/api/produto/<id>', methods=['DELETE'])
def delete_produto(id):
    try:
        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()

        # Remove vínculos na ficha técnica
        cursor.execute("DELETE FROM fichas_tecnicas WHERE produto_final_id = ?", (id,))
        # Remove o produto
        cursor.execute("DELETE FROM produtos_finais WHERE id = ?", (id,))

        conn.commit()
        return jsonify({'status': 'ok', 'mensagem': 'Produto excluído com sucesso'})

    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/produto/<id>', methods=['PUT'])
def update_produto(id):
    try:
        data = request.get_json()
        nome = data.get('nomeProduto')
        materias = data.get('materias', [])

        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()

        # Atualiza nome do produto na tabela produtos_finais
        cursor.execute("UPDATE produtos_finais SET nome = ? WHERE id = ?", (nome, id))

        # Remove vínculos antigos
        cursor.execute("DELETE FROM fichas_tecnicas WHERE produto_final_id = ?", (id,))

        # Insere vínculos novos
        for m in materias:
            codigo_materia = m.get('materiaPrima')   # já é o mp.codigo
            quantidade = float(m.get('quantidade', 0))

            cursor.execute("""
                INSERT INTO fichas_tecnicas (produto_final_id, materia_prima_id, quantidade)
                VALUES (?, ?, ?)
            """, (id, codigo_materia, quantidade))

        conn.commit()
        return jsonify({'status': 'ok', 'mensagem': 'Produto atualizado com sucesso'})

    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/divergencias/<descricao>', methods=['GET'])
def get_divergencias(descricao):
    try:
        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, descricao_origem, nome_corrigido, preco_origem, fonte, data
            FROM divergencias
            WHERE UPPER(TRIM(descricao_origem)) = UPPER(TRIM(?))
            ORDER BY id DESC
        """, (descricao,))
        rows = cursor.fetchall()

        divergencias = [
            {
                "id": r[0],
                "descricao_origem": r[1],
                "nome_corrigido": r[2],
                "preco_origem": r[3],
                "fonte": r[4],
                "data": r[5],
            }
            for r in rows
        ]

        return jsonify(divergencias)

    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/divergencias/<id>', methods=['PUT'])
def corrigir_divergencia(id):
    try:
        data = request.get_json()
        nome_corrigido = data.get("nome_corrigido")

        if not nome_corrigido:
            return jsonify({
                "status": "erro",
                "mensagem": "Nome corrigido é obrigatório"
            }), 400

        conn = sqlite3.connect('produtos.db')
        cursor = conn.cursor()

        # Atualiza divergência: salva o nome corrigido e marca como resolvido
        cursor.execute("""
            UPDATE divergencias
            SET nome_corrigido = ?,
                resolvido = 1
            WHERE id = ?
        """, (nome_corrigido, id))

        # Atualiza histórico para refletir o novo nome
        cursor.execute("""
            UPDATE historico
            SET descricao_produto = ?
            WHERE descricao_produto = (
                SELECT descricao_origem FROM divergencias WHERE id = ?
            )
        """, (nome_corrigido, id))

        conn.commit()
        return jsonify({
            "status": "ok",
            "mensagem": "Divergência corrigida, histórico atualizado e marcada como resolvida"
        })

    except Exception as e:
        print("Erro ao corrigir divergência:", e)
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    finally:
        conn.close()



DB = "produtos.db"

def get_conn():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

# -----------------------------
# LISTAR FICHA TÉCNICA DE UM PRODUTO
# -----------------------------
@app.route("/api/fichas_tecnicas/<produto_final_id>", methods=["GET"])
def get_ficha(produto_final_id):
    try:
        conn = sqlite3.connect("produtos.db")
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Busca o nome do produto final
        cur.execute("SELECT nome FROM produtos_finais WHERE id = ?", (produto_final_id,))
        produto = cur.fetchone()
        if not produto:
            return jsonify({"erro": "Produto final não encontrado"}), 404

        # Busca os itens da ficha técnica
        cur.execute("""
            SELECT ft.id, ft.materia_prima_id, ft.quantidade,
                   mp.descricao_produto as materia_prima_nome, mp.unidade, mp.preco_unitario as preco_unitario
            FROM fichas_tecnicas ft
            JOIN materias_primas mp ON mp.codigo = ft.materia_prima_id
            WHERE ft.produto_final_id = ?
        """, (produto_final_id,))
        rows = cur.fetchall()
        conn.close()

        materiais = [{
            "id": r["id"],
            "codigo": r["materia_prima_id"],
            "nome": r["materia_prima_nome"],
            "unidade": r["unidade"],
            "valor": r["preco_unitario"],
            "quantidade": r["quantidade"]
        } for r in rows]

        return jsonify({
            "produto_final_id": produto_final_id,
            "nome": produto["nome"],   # 👈 agora vem o nome do produto
            "materiais": materiais
        })
    except Exception as e:
        print("Erro no backend:", e)
        return jsonify({"erro": "Falha interna no servidor"}), 500

# -----------------------------
# ATUALIZAR FICHA TÉCNICA DE UM PRODUTO
# -----------------------------
@app.route("/api/fichas_tecnicas/<produto_final_id>", methods=["PUT"])
def update_ficha(produto_final_id):
    data = request.get_json()
    materias = data.get("materias", [])

    conn = get_conn()
    cur = conn.cursor()

    # Apaga os registros antigos
    cur.execute("DELETE FROM fichas_tecnicas WHERE produto_final_id = ?", (produto_final_id,))

    # Insere os novos
    for m in materias:
        cur.execute("""
            INSERT INTO fichas_tecnicas (produto_final_id, materia_prima_id, quantidade)
            VALUES (?, ?, ?)
        """, (
            produto_final_id,
            m.get("materiaPrima") or m.get("codigo"),
            float(m.get("quantidade", 0))
        ))

    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})

# -----------------------------
# DELETAR FICHA TÉCNICA DE UM PRODUTO
# -----------------------------
@app.route("/api/fichas_tecnicas/<produto_final_id>", methods=["DELETE"])
def delete_ficha(produto_final_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM fichas_tecnicas WHERE produto_final_id = ?", (produto_final_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

# -----------------------------
# CRIAR NOVA FICHA TÉCNICA
# -----------------------------
@app.route("/api/fichas_tecnicas", methods=["POST"])
def create_ficha():
    data = request.get_json()
    produto_final_id = data.get("produto_final_id")
    materias = data.get("materias", [])

    conn = get_conn()
    cur = conn.cursor()

    for m in materias:
        cur.execute("""
            INSERT INTO fichas_tecnicas (produto_final_id, materia_prima_id, quantidade)
            VALUES (?, ?, ?)
        """, (
            produto_final_id,
            m.get("materiaPrima") or m.get("codigo"),
            float(m.get("quantidade", 0))
        ))

    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})

@app.route('/api/materias/<codigo_antigo>', methods=['PUT'])
def update_materia(codigo_antigo):
    try:
        data = request.get_json()
        novo_nome = data.get("nome")
        novo_codigo = data.get("codigo")

        if not novo_nome or not novo_codigo:
            return jsonify({"erro": "Nome e código são obrigatórios"}), 400

        conn = sqlite3.connect("produtos.db")
        cur = conn.cursor()

        # pega nome antigo no historico
        cur.execute("SELECT descricao_produto FROM historico WHERE codigo = ?", (codigo_antigo,))
        row = cur.fetchone()
        if not row:
            return jsonify({"erro": "Matéria-prima não encontrada no histórico"}), 404
        nome_antigo = row[0]

        # atualiza historico (nome e código)
        cur.execute("""
            UPDATE historico
            SET descricao_produto = ?, codigo = ?
            WHERE codigo = ?
        """, (novo_nome, novo_codigo, codigo_antigo))
        print("Linhas afetadas no historico:", cur.rowcount)

        # registra divergência como resolvida
        cur.execute("""
            UPDATE divergencias
            SET nome_corrigido = ?, resolvido = 1
            WHERE descricao_origem = ? AND (nome_corrigido IS NULL OR nome_corrigido = '')
        """, (novo_nome, nome_antigo))

        if cur.rowcount == 0:
            cur.execute("""
                INSERT INTO divergencias (descricao_origem, nome_corrigido, resolvido)
                VALUES (?, ?, 1)
            """, (nome_antigo, novo_nome))

        conn.commit()
        conn.close()
        return jsonify({"status": "ok"})

    except Exception as e:
        print("Erro ao atualizar matéria-prima:", e)
        return jsonify({"erro": str(e)}), 500
    
if __name__ == "__main__":
    app.run(debug=True)
