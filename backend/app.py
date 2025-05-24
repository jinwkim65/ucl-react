# App.py
import sqlite3
from flask import Flask, jsonify, request
from flask.helpers import send_from_directory
from flask_cors import CORS
from flask_restful import Api

from api.SearchEndpoint import SearchEndpoint
from api.FindEndpoint import FindEndpoint

app = Flask(__name__, static_folder='../frontend/build',static_url_path='/')
CORS(app)  # allow React dev server to call this API
api = Api(app)

api.add_resource(SearchEndpoint, '/search/<int:page>')
api.add_resource(FindEndpoint, '/find/<int:page>')

@app.route('/')
@app.route('/find')
def serve():
    """Serve the React app."""
    return send_from_directory(app.static_folder, 'index.html')

DATABASE = 'data.db'

def get_db():
    """Opens a new database connection and sets row factory for dict output."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

if __name__ == '__main__':
    app.run(debug=True)
