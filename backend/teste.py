import sqlite3
conn = sqlite3.connect('produtos.db')
cursor = conn.cursor()
# Criar tabela fichas_tecnicas



cursor.execute("PRAGMA table_info(materias_primas);")
print(cursor.fetchall())

conn.commit()
conn.close()    
