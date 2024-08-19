from flask import Flask, render_template, request, jsonify
import sqlite3
from query_builder import QueryBuilder

app = Flask(__name__)
query_builder = QueryBuilder()

def get_db_connection():
    conn = sqlite3.connect('FortiLucene.db')
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
    print(table_name)
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

if __name__ == '__main__':
    app.run(debug=True)
