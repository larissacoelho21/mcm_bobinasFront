import sqlite3
conn = sqlite3.connect('produtos.db')
cursor = conn.cursor()

for i in cursor.execute("""SELECT * FROM historico"""):
    print(i)