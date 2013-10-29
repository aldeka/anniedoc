import json
import os
from flask import Flask, request, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.csrf import csrf

DEBUG = True

app = Flask(__name__)
app.config.from_object(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/karen/Code/elsinore/test.db'
db = SQLAlchemy(app)

try:
    session_secret = os.environ['SESSION_SECRET']
except KeyError:
    from localconfig import secret
    session_secret = secret

app.secret_key = session_secret
csrf(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about/')
def about():
    return render_template('about.html')

@app.route('/api/annotation', methods=['GET', 'POST'])
def api():
    if request.method == 'POST':
        print request.form
        a = Annotation(request.form['line'], request.form['author'], request.form['text'])
        print a
        try:
            db.session.add(a)
            db.session.commit()
        except:
            db.create_all()
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
        try:
            all_annotations = Annotation.query.all()
        except:
            db.create_all()
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