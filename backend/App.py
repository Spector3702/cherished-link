from flask import Flask
from flask_cors import CORS

from routes.phone_routes import phone_routes
from routes.watch_routes import watch_routes


app = Flask(__name__)
CORS(app)
app.register_blueprint(phone_routes)
app.register_blueprint(watch_routes)

app.config['EXPO_PUSH_TOKEN'] = None
app.config['MATCH_NUMBER'] = None
app.config['MATCH_STATUS'] = None
app.config['HOME_LOCATION'] = None


if __name__ == '__main__':
    app.run("0.0.0.0")
