import json
import os
from flask import Flask, request, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.csrf import csrf

DEBUG = True

app = Flask(__name__)
app.config.from_object(__name__)

try:
    session_secret = os.environ['SESSION_SECRET']
    postgres_password = os.environ['DB_PWD']
except KeyError:
    from localconfig import secret, postgres_password
    postgres_password = postgres_password
    session_secret = secret

app.secret_key = session_secret
csrf(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://annie:' + postgres_password + '@localhost/annotationdb'
db = SQLAlchemy(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about/')
def about():
    return render_template('about.html')

@app.route('/api/annotation', methods=['GET', 'POST'])
def api():
    if request.method == 'POST':
        # print request.form
        a = Annotation(request.form['line'], request.form['author'], request.form['text'])
        # print a
        db.session.add(a)
        db.session.commit()
        dico = {
            'id': a.id, 
            'author': a.author,
            'text': a.text,
            'line': a.line,
            }
        return json.dumps(dico)
    else:
        all_annotations = Annotation.query.all()
        data = {}
        data['keys'] = []
        for annotation in all_annotations:
            dico = {
                    'id': annotation.id, 
                    'author': annotation.author,
                    'text': annotation.text
                    }
            if annotation.line in data['keys']:
                data[annotation.line]['count'] += 1
                data[annotation.line]['annotations'].append(dico)
            else:
                data['keys'].append(annotation.line)
                data[annotation.line] = {
                    'count': 1,
                    'annotations': [dico]
                }
        return json.dumps(data)

class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    line = db.Column(db.String(30))
    author = db.Column(db.String(120))
    text = db.Column(db.String(600))

    def __init__(self, line, author, text):
        self.line = line
        self.author = author
        self.text = text

    def __repr__(self):
        return '<Annotation of %r>' % self.line


if __name__ == '__main__':
    app.run()