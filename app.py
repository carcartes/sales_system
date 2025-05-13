from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.branch_routes import branch_blueprint
from routes.sales_routes import sales_blueprint
from routes.stock_routes import stock_blueprint
from routes.sse_routes import sse_blueprint
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],  # Ajusta según tu frontend
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Configuración de la aplicación
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['MONGO_URI'] = os.getenv('MONGO_URI')

# Registrar blueprints
app.register_blueprint(branch_blueprint, url_prefix='/api/branches')
app.register_blueprint(sales_blueprint, url_prefix='/api/sales')
app.register_blueprint(stock_blueprint, url_prefix='/api/stock')
app.register_blueprint(sse_blueprint, url_prefix='/api/notifications')

if __name__ == '__main__':
    logger.info("Iniciando servidor Flask...")
    app.run(debug=True) 