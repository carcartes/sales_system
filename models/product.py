from datetime import datetime

class Product:
    def __init__(self, id, name, price, stock, branch_id=None, is_matriz=False):
        self.id = id
        self.name = name
        self.price = price
        self.stock = stock
        self.branch_id = branch_id
        self.is_matriz = is_matriz
        self.last_updated = datetime.utcnow()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "stock": self.stock,
            "branch_id": self.branch_id,
            "is_matriz": self.is_matriz,
            "last_updated": self.last_updated
        }

    @staticmethod
    def from_dict(data):
        return Product(
            id=data.get('id'),
            name=data.get('name'),
            price=data.get('price'),
            stock=data.get('stock'),
            branch_id=data.get('branch_id'),
            is_matriz=data.get('is_matriz', False)
        ) 