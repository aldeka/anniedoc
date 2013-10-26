from flask import Flask, request
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = SQLAlchemy(app)

@app.route('/')
def index():
    return 'Hello World!'

@app.route('/about')
def about():
    return 'About page!'

@app.route('/api', methods=['GET', 'POST'])
def api():
    if request.method == 'POST':
        return 'blah'
    else:
        return 'lol'


class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String(120))
    text = db.Column(db.String(600))


if __name__ == '__main__':
    app.run()