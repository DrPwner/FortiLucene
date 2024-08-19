# app/main.py

from flask import Flask, render_template, request, jsonify
from .query_builder import query_builder
from .ip_processor import process_ip_file

app = Flask(__name__)
app.config.from_object('config.Config')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/build_query', methods=['POST'])
def build_query():
    data = request.json
    query_builder.clear()
    
    for query_part in data['query_parts']:
        query_builder.add_query_part(query_part['field'], query_part['value'], query_part['operator'])
    
    if 'ip_file' in data:
        ips = process_ip_file(data['ip_file'])
        query_builder.process_ip_list(ips, data['include_ips'])
    
    query = query_builder.build_query()
    
    if not query_builder.validate_query(query):
        return jsonify({"error": "Invalid query constructed"}), 400
    
    return jsonify({"query": query})
