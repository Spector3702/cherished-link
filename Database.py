import pymongo

class MongoDB():
    def __init__(self, host: str, account: str , passwrod: str, port: int) -> None:
        client = pymongo.MongoClient(f"mongodb://{account}:{passwrod}@{host}:{port}/")
        self.db = client["DementiaDetection"]

    def save(self, data) -> None:
        table = self.db["detection"]
        table.insert_one(data)