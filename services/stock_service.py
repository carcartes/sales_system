from config.mongodb import stock_collection
from models.stock import Stock
from services.sse_service import notify_low_stock

class StockService:
    def __init__(self):
        pass

    def set_stock(self, producto_id, sucursal, cantidad):
        stock_doc = stock_collection.find_one({"producto_id": producto_id, "sucursal": sucursal})
        if stock_doc:
            stock_collection.update_one({"_id": stock_doc["_id"]}, {"$set": {"stock": cantidad}})
        else:
            stock_collection.insert_one({"producto_id": producto_id, "sucursal": sucursal, "stock": cantidad})
        # Notificación SSE
        from config.mongodb import matriz_collection
        prod = matriz_collection.find_one({'id': producto_id})
        nombre = prod['name'] if prod else producto_id
        if int(cantidad) == 0:
            notify_low_stock(sucursal, nombre, 'agotado')
        elif int(cantidad) < 10:
            notify_low_stock(sucursal, nombre, 'bajo')
        return True

    def get_stock(self, producto_id):
        stocks = stock_collection.find({"producto_id": producto_id})
        return [Stock.from_dict(s).to_dict() for s in stocks]

    def get_stock_for_sucursal(self, sucursal):
        stocks = stock_collection.find({"sucursal": sucursal})
        return [Stock.from_dict(s).to_dict() for s in stocks]

    def decrement_stock(self, producto_id, sucursal, cantidad):
        """Resta la cantidad indicada al stock del producto en la sucursal. Devuelve True si tuvo éxito."""
        stock_doc = stock_collection.find_one({"producto_id": producto_id, "sucursal": sucursal})
        if not stock_doc:
            return False  # No hay stock registrado
        current_stock = stock_doc.get('stock', 0)
        if current_stock < cantidad:
            return False  # No hay suficiente stock
        new_stock = current_stock - cantidad
        stock_collection.update_one({"_id": stock_doc["_id"]}, {"$set": {"stock": new_stock}})
        # Notificación SSE
        from config.mongodb import matriz_collection
        prod = matriz_collection.find_one({'id': producto_id})
        nombre = prod['name'] if prod else producto_id
        if new_stock == 0:
            notify_low_stock(sucursal, nombre, 'agotado')
        elif new_stock < 10:
            notify_low_stock(sucursal, nombre, 'bajo')
        return True 