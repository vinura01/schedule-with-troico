from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# Initialize the database
def init_db():
    conn = sqlite3.connect('lectures.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lectures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            start_time TEXT,
            end_time TEXT,
            description TEXT,
            type TEXT DEFAULT 'lecture'
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/lectures', methods=['GET', 'POST'])
def lectures():
    conn = sqlite3.connect('lectures.db')
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute("SELECT * FROM lectures")
        rows = cursor.fetchall()
        conn.close()

        events = [
            {
                'id': row[0],
                'title': row[1],
                'start': row[2],
                'end': row[3],
                'description': row[4],
                'type': row[5]
            } for row in rows
        ]
        return jsonify(events)

    if request.method == 'POST':
        data = request.json
        cursor.execute("INSERT INTO lectures (title, start_time, end_time, description, type) VALUES (?, ?, ?, ?, ?)",
                       (data['title'], data['start'], data['end'], data['description'], data.get('type', 'lecture')))
        conn.commit()
        conn.close()
        return {'message': 'Lecture added successfully'}, 201

@app.route('/api/lectures/<int:lecture_id>', methods=['DELETE'])
def delete_lecture(lecture_id):
    conn = sqlite3.connect('lectures.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM lectures WHERE id = ?", (lecture_id,))
    conn.commit()
    conn.close()
    return {'message': 'Lecture deleted successfully'}

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
