import requests
import os
from config.mongodb import matriz_collection, stock_collection
from models.product import Product
from services.currency_service import currency_service
from services.sse_service import notify_low_stock
import base64

class ProductService:
    def __init__(self):
        pass

    def get_branch_stock(self, branch_id, sort_by=None, sort_order=None):
        """Obtiene productos y el stock real de la sucursal desde la colección stock"""
        # Obtener todos los productos
        products = list(matriz_collection.find({}))
        # Obtener el stock de la sucursal para todos los productos
        stock_map = {s['producto_id']: s['stock'] for s in stock_collection.find({"sucursal": branch_id})}
        # Unir productos con su stock real
        product_list = []
        for p in products:
            product = Product.from_dict(p).to_dict()
            # Codificar imagen a base64 si es binario
            if product.get('imagen') and isinstance(product['imagen'], (bytes, bytearray)):
                product['imagen'] = base64.b64encode(product['imagen']).decode('utf-8')
            # Asignar el stock real de la sucursal (o 0 si no hay registro)
            product['stock'] = stock_map.get(product['id'], 0)
            product['price_usd'] = currency_service.clp_to_usd(product['price'])
            product_list.append(product)
        # Ordenar si corresponde
        if sort_by in ['stock', 'price']:
            reverse = sort_order == 'desc'
            product_list.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)
        return product_list

    def get_matriz_stock(self, sort_by=None, sort_order=None):
        """Obtiene stock y precio desde MongoDB local con ordenamiento opcional"""
        query = {'is_matriz': True}
        sort_params = []
        
        # Validar y aplicar ordenamiento
        if sort_by in ['stock', 'price']:
            sort_direction = 1 if sort_order == 'asc' else -1
            sort_params.append((sort_by, sort_direction))
        
        products = matriz_collection.find(query)
        if sort_params:
            products = products.sort(sort_params)
        
        # Convertir los productos y agregar precio en USD
        product_list = []
        for p in products:
            product = Product.from_dict(p).to_dict()
            # Codificar imagen a base64 si es binario
            if product.get('imagen') and isinstance(product['imagen'], (bytes, bytearray)):
                product['imagen'] = base64.b64encode(product['imagen']).decode('utf-8')
            product['price_usd'] = currency_service.clp_to_usd(product['price'])
            product_list.append(product)
        return product_list

    def set_stock(self, branch_id, product_id, new_stock):
        """Establece el stock a un valor específico"""
        try:
            query = {'id': product_id}
            if branch_id != 'matriz':
                query['branch_id'] = branch_id
            else:
                query['is_matriz'] = True

            if new_stock < 0:
                print(f"Error: El stock no puede ser negativo ({new_stock})")
                return False

            # Obtener el producto antes de actualizar
            product = matriz_collection.find_one(query)
            if not product:
                return False

            result = matriz_collection.update_one(
                query,
                {'$set': {'stock': int(new_stock)}}
            )
            
            # Verificar el nivel de stock y enviar notificación
            if new_stock == 0:
                notify_low_stock(branch_id, product['name'], 'agotado')
            elif new_stock <= 5:
                notify_low_stock(branch_id, product['name'], 'bajo')

            return result.modified_count > 0
        except Exception as e:
            print(f"Error setting stock: {str(e)}")
            return False

    def update_stock_for_sale(self, branch_id, product_id, quantity):
        """Actualiza el stock para una venta (resta la cantidad)"""
        try:
            query = {'id': product_id}
            if branch_id != 'matriz':
                query['branch_id'] = branch_id
            else:
                query['is_matriz'] = True

            # Primero obtenemos el stock actual
            product = matriz_collection.find_one(query)
            if not product:
                return False

            current_stock = product.get('stock', 0)
            new_stock = current_stock - quantity  # Restamos la cantidad vendida

            # Verificar que el stock no quede negativo
            if new_stock < 0:
                print(f"Error: No hay suficiente stock disponible ({current_stock} < {quantity})")
                return False

            result = matriz_collection.update_one(
                query,
                {'$set': {'stock': int(new_stock)}}
            )
            
            # Verificar el nivel de stock y enviar notificación
            if new_stock == 0:
                notify_low_stock(branch_id, product['name'], 'agotado')
            elif new_stock <= 5:
                notify_low_stock(branch_id, product['name'], 'bajo')
            
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating stock for sale: {str(e)}")
            return False 