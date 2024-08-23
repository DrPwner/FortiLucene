from flask import Flask, render_template, request, jsonify, Response
import sqlite3
from query_builder import QueryBuilder
import io
import csv
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
query_builder = QueryBuilder()

def get_db_connection():
    conn = sqlite3.connect(r'FortiLucene.db')
    conn.row_factory = sqlite3.Row
    return conn

# Map space-separated display names to actual table names
CATEGORY_MAP = {
    "Process Information Queries": "ProcessInformation",
    "Network Information Queries": "NetworkInformation",
    "Basic File Information Queries": "FileInformationBasic",
    "Advanced File Information Queries": "FileInformationAdvanced",
    "General Device Information Queries": "GeneralDeviceInformation",
    "Event Information Queries": "EventInformation",
    "Registry Information Queries": "RegistryInformation",
    "MITRE Queries": "MITREinformation",
    "Cloud Container Information Queries": "CloudContainerInformation"
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_categories')
def get_categories():
    # Return the display names (space-separated)
    categories = list(CATEGORY_MAP.keys())
    return jsonify(categories)

@app.route('/get_queries/<category>')
def get_queries(category):
    # Convert the display name to the actual table name
    table_name = CATEGORY_MAP.get(category)
   
    if not table_name:
        return jsonify({"error": "Invalid category"}), 400

    conn = get_db_connection()
    queries = conn.execute(f'SELECT FamilyFriendlyQuery, BuiltInQuery FROM {table_name}').fetchall()
    conn.close()
    return jsonify([{'friendly': q['FamilyFriendlyQuery'], 'builtin': q['BuiltInQuery']} for q in queries])

@app.route('/build_query', methods=['POST'])
def build_query():
    data = request.json
    query_builder.clear()
    
    for query_part in data['query_parts']:
        query_operator = query_part['queryOperator']
        builtin = query_part['builtin']
        value = query_part['value']
        operator = query_part['operator']

        if query_operator != '→':
            if query_operator in ['-', '!']:
                builtin = f"{query_operator}{builtin}"
            elif query_operator == 'NOT':
                builtin = f"NOT {builtin}"

        query_builder.add_query_part(builtin, value, operator)
    
    query = query_builder.build_query()
    
    if not query_builder.validate_query(query):
        return jsonify({"error": "Invalid query constructed"}), 400
    
    return jsonify({"query": query})


@app.route('/get_database_content')
def get_database_content():
    conn = get_db_connection()
    content = {}
    tables = ['SavedQueries', 'ProcessInformation', 'NetworkInformation', 'FileInformationBasic', 'FileInformationAdvanced', 'GeneralDeviceInformation', 'EventInformation', 'MITREinformation', 'CloudContainerInformation']
    
    for table in tables:
        rows = conn.execute(f'SELECT * FROM {table}').fetchall()
        content[table] = [dict(row) for row in rows]  # Convert Row objects to dictionaries
    
    conn.close()
    return jsonify(content)

@app.route('/edit_query', methods=['POST'])
def edit_query():
    data = request.json
    conn = get_db_connection()
    try:
        conn.execute(f"UPDATE {data['table']} SET FamilyFriendlyQuery = ?, BuiltInQuery = ? WHERE ID = ?",
                     (data['familyFriendly'], data['builtIn'], data['id']))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()

@app.route('/delete_query', methods=['POST'])
def delete_query():
    data = request.json
    conn = get_db_connection()
    try:
        conn.execute(f"DELETE FROM {data['table']} WHERE ID = ?", (data['id'],))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()

@app.route('/save_custom_query', methods=['POST'])
def save_custom_query():
    data = request.json
    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO SavedQueries (FamilyFriendlyQuery, BuiltInQuery) VALUES (?, ?)",
                     (data['name'], data['query']))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    finally:
        conn.close()


@app.route('/export_saved_queries')
def export_saved_queries():
    conn = get_db_connection()
    queries = conn.execute('SELECT FamilyFriendlyQuery, BuiltInQuery FROM SavedQueries').fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['FamilyFriendlyQuery', 'BuiltInQuery'])  # CSV Header
    for query in queries:
        writer.writerow([query['FamilyFriendlyQuery'], query['BuiltInQuery']])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename=SavedQueries Export - {datetime.now().strftime('%Y-%m-%d - %H-%M-%S')}.csv"}
    )

@app.route('/import_saved_queries', methods=['POST'])
def import_saved_queries():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"})
    
    if file and file.filename.endswith('.csv'):
        try:
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            csv_input = csv.reader(stream)
            header = next(csv_input)  # Skip the header row
            
            if header != ['FamilyFriendlyQuery', 'BuiltInQuery']:
                return jsonify({"success": False, "error": "Invalid CSV format"})

            conn = get_db_connection()
            for row in csv_input:
                conn.execute('INSERT INTO SavedQueries (FamilyFriendlyQuery, BuiltInQuery) VALUES (?, ?)', (row[0], row[1]))
            conn.commit()
            conn.close()

            return jsonify({"success": True})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)})
    else:
        return jsonify({"success": False, "error": "Invalid file type. Please upload a CSV file."})



if __name__ == '__main__':
    app.run(debug=True)
