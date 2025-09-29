import sqlite3

# conecta no banco
conn = sqlite3.connect("produtos.db")
cursor = conn.cursor()

conn = sqlite3.connect("produtos.db")
cur = conn.cursor()

# Estrutura da tabela materias_primas
cur.execute("PRAGMA table_info(materias_primas);")
print("materias_primas:", cur.fetchall())

# Estrutura da tabela historico
cur.execute("PRAGMA table_info(historico);")
print("historico:", cur.fetchall())

# Estrutura da tabela divergencias
cur.execute("PRAGMA table_info(divergencias);")
print("divergencias:", cur.fetchall())



conn.commit()
conn.close()
