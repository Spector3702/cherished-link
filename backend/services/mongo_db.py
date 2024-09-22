import pymongo

class MongoDB():
    def __init__(self, host: str, port: int, db: str) -> None:
        client = pymongo.MongoClient(f"mongodb://{host}:{port}/")
        self.db = client[db]

    def save(self, collection, data) -> None:
        table = self.db[collection]
        table.insert_one(data)