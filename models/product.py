from datetime import datetime

class Product:
    def __init__(self, id, name, price, stock, branch_id=None, is_matriz=False, imagen=None):
        self.id = id
        self.name = name
        self.price = price
        self.stock = stock
        self.branch_id = branch_id
        self.is_matriz = is_matriz
        self.last_updated = datetime.utcnow()
        self.imagen = imagen

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "stock": self.stock,
            "branch_id": self.branch_id,
            "is_matriz": self.is_matriz,
            "last_updated": self.last_updated,
            "imagen": self.imagen
        }

    @staticmethod
    def from_dict(data):
        # Permitir ambos esquemas: (id, name, price) o (codigo, nombre, precio)
        return Product(
            id=data.get('id') or data.get('codigo'),
            name=data.get('name') or data.get('nombre'),
            price=data.get('price') or data.get('precio'),
            stock=data.get('stock', 0),
            branch_id=data.get('branch_id'),
            is_matriz=data.get('is_matriz', False),
            imagen=data.get('imagen')
        ) 