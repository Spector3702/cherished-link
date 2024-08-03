from flask import Flask, request
from flask_cors import CORS
import json
from datetime import datetime
from Translators import Translators
from DementiaDetection import DementiaDetection
from Database import MongoDB

app = Flask(__name__)
CORS(app)
translators = Translators()
dementiaDetection = DementiaDetection()
db = MongoDB(host="localhost", account="root", passwrod="1234", port=27017)

@app.route("/detection", methods=["POST"])
def detection():
    requestData = request.get_json()
    translationContent = translators.chineseToEnglish(requestData["content"])
    detection = dementiaDetection.detection(translationContent)
    result = {"user": requestData["user"], "content": requestData["content"], "translationContent": translationContent, "detection": detection, "createTime": str(datetime.now())}
    db.save(result)
    return json.dumps({"user": requestData["user"], "detection": detection})


if __name__ == '__main__':
    app.run("0.0.0.0")