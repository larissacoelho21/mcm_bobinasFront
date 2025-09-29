import sqlite3

# conecta no banco
conn = sqlite3.connect("produtos.db")
cursor = conn.cursor()

conn = sqlite3.connect("produtos.db")
cur = conn.cursor()

# Estrutura da tabela materias_primas

# Estrutura da tabela historico
cur.execute("UPDATE historico SET unidade = 'L' WHERE descricao_produto = 'VERNIZ';")
print("historico:", cur.fetchall())


conn.commit()
conn.close()
