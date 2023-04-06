from flask import Flask, jsonify
from flask_cors import CORS

from dotenv import load_dotenv
import os
import random

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String
 
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import json
from surprise import Reader, Dataset
from surprise import SVD

from sklearn.svm import SVC
from sklearn import svm
from sklearn import preprocessing

from sklearn.naive_bayes import GaussianNB


app = Flask(__name__)
CORS(app, supports_credentials=True)

MUSIC_DIR = "data\\music"
DATA_DIR = "data"
EMOTION_DATA = os.path.join(DATA_DIR, "emotions.json")
SITUATION_DATA = os.path.join(DATA_DIR, "situations.json")
WEATHER_DATA = os.path.join(DATA_DIR, "weathers.json")

load_dotenv()
mysql_url = "mysql+pymysql://" + os.environ.get('DB_USER') + ":"+ os.environ.get('DB_PASS') + "@" + os.environ.get('DB_URL') +"?charset=utf8"
engine = create_engine(mysql_url, echo=True)
Base = declarative_base()

class Music(Base):
    __tablename__ = 'music'

    music_id = Column(Integer, primary_key=True)
    title = Column(String)
    singer = Column(String)
    youtube_url = Column(String)
    thumbnail_url = Column(String)

class Music_Feature(Base):
    __tablename__ = 'music_feature'

    music_id = Column(Integer, primary_key=True)
    dance_ability = Column(Integer)
    energy = Column(Integer)
    valence = Column(Integer)
    key = Column(Integer)
    popularity = Column(Integer)
    tempo = Column(Integer)

class E_Music(Base):
    __tablename__ = 'e_music'

    music_id = Column(Integer, primary_key=True)
    popularity = Column(Integer)
    emotion_id = Column(Integer)

class S_Music(Base):
    __tablename__ = 's_music'

    music_id = Column(Integer, primary_key=True)
    popularity = Column(Integer)
    situation_id = Column(Integer)

class W_Music(Base):
    __tablename__ = 'w_music'

    music_id = Column(Integer, primary_key=True)
    popularity = Column(Integer)
    weather_id = Column(Integer)

class My_Eighteen(Base):
    __tablename__ = 'my_eighteen'

    my_eighteen_id = Column(Integer, primary_key=True)
    music_id = Column(Integer)
    user_id = Column(Integer)

Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)

@app.route('/flask/insert')
def dataInsert():
    with DBSession() as session:
        DATA_FILE = os.path.join(MUSIC_DIR, "music_feature.json")
        with open(DATA_FILE, encoding="utf-8") as f:
            data = json.loads(f.read())
            for music_data in data:
                print(music_data)
                music_id = music_data['id']

                # Check if the music_id already exists in the database
                existing_music = session.query(Music).filter(Music.music_id == music_id).first()
                existing_musicFeature = session.query(Music_Feature).filter(Music_Feature.music_id == music_id).first()
                if existing_music:
                    music = session.query(Music).filter(Music.music_id == music_id).first()
                    music.thumbnail_url = music_data['thumbnail_url']
                    session.add(music)
                    if not existing_musicFeature:
                        # Handle empty values
                        danceability = music_data['danceability'] if music_data['danceability'] != '' else 0
                        energy = music_data['energy'] if music_data['energy'] != '' else 0
                        valence = music_data['valence'] if music_data['valence'] != '' else 0
                        key = music_data['key'] if music_data['key'] != '' else 0
                        tempo = music_data['tempo'] if music_data['tempo'] != '' else 0
                        music_feature = Music_Feature(music_id=music_id, dance_ability=danceability, energy=energy, valence=valence, key=key, popularity=music_data['popularity'], tempo=tempo)
                        session.add(music_feature)

        try:
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"An error occurred while inserting data: {e}")

    return "Success"

@app.route('/flask/predict/emotion')
def emotion_classification(data_path=EMOTION_DATA):
    with DBSession() as session:
        session.query(E_Music).delete()
        session.commit()
        music_features = session.query(Music_Feature).all()
        musics = session.query(Music).all()

    music_feature_df = pd.DataFrame([mf.__dict__ for mf in music_features])
    music_df = pd.DataFrame([mf.__dict__ for mf in musics])
    df = pd.merge(music_feature_df, music_df, on=["music_id"])

    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())
        
    emotion_df = pd.DataFrame(data)
    emotion_df = emotion_df.dropna(axis=0)

    X = emotion_df[['energy', 'dance_ability', 'tempo']]
    y = emotion_df['emotion']

    clf = DecisionTreeClassifier()
    clf.fit(X, y)

    pred_X = df[['energy', 'dance_ability', 'tempo']]
    predicted_emotion = clf.predict(pred_X)
    df['emotion'] = predicted_emotion

    df.loc[(df['emotion'] == 3) & (df['tempo'] >= 119), 'emotion'] = 1
    df.loc[(df['emotion'] == 3) & (df['tempo'] >= 82), 'emotion'] = 3

    sad_words = ['Sad','눈물', '이별']
    love_words = ['사랑', 'love', 'Love']

    for i, title in enumerate(df['title']):
        if any(word in title for word in sad_words):
            df.loc[i, 'emotion'] = 2
        elif any(word in title for word in love_words):
            df.loc[i, 'emotion'] = 4

    for music_id, popularity, emotion in zip(df['music_id'], df['popularity'], df['emotion']):
        e_music = E_Music(music_id=music_id, popularity=popularity, emotion_id=emotion)
        session.add(e_music)

    try:
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"An error occurred while inserting data: {e}")

    return "success"

@app.route('/flask/predict/situation')
def situation_classification(data_path=SITUATION_DATA):
    with DBSession() as session:
        session.query(S_Music).delete()
        session.commit()
        music_features = session.query(Music_Feature).all()
        musics = session.query(Music).all()

    music_feature_df = pd.DataFrame([mf.__dict__ for mf in music_features])
    music_df = pd.DataFrame([mf.__dict__ for mf in musics])
    df = pd.merge(music_feature_df, music_df, on=["music_id"])

    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())
        
    situation_df = pd.DataFrame(data)
    situation_df = situation_df.dropna(axis=0)

    X = situation_df[['energy', 'dance_ability', 'tempo']]
    y = situation_df['situation']

    scaler = preprocessing.StandardScaler()
    X = scaler.fit_transform(X)

    svm_clf = svm.SVC()
    svm_clf.fit(X, y)

    pred_X = df[['energy', 'dance_ability', 'tempo']]
    pred_X = scaler.transform(pred_X)
    predicted_situation = svm_clf.predict(pred_X)
    df['situation'] = predicted_situation
    
    df.loc[(df['situation'] == 1) & (df['tempo'] >= 167), 'situation'] = 1
    df.loc[(df['situation'] == 2) & (df['tempo'] >= 90), 'situation'] = 2
    df.loc[(df['situation'] == 3) & (df['tempo'] >= 179), 'situation'] = 3
    df.loc[(df['situation'] == 4) & (df['tempo'] >= 109), 'situation'] = 4

    date_words = ['사랑']
    travel_words = ['여행']
    breakup_words = ['이별']
    wedding_words = ['결혼', '청혼']

    for i, title in enumerate(df['title']):
        if any(word in title for word in date_words):
            df.loc[i, 'situation'] = 2
        elif any(word in title for word in travel_words):
            df.loc[i, 'situation'] = 4
        elif any(word in title for word in breakup_words):
            df.loc[i, 'situation'] = 5
        elif any(word in title for word in wedding_words):
            df.loc[i, 'situation'] = 6

    for music_id, popularity, situation in zip(df['music_id'], df['popularity'], df['situation']):
        s_music = S_Music(music_id=music_id, popularity=popularity, situation_id=situation)
        session.add(s_music)

    try:
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"An error occurred while inserting data: {e}")

    return "success"

@app.route('/flask/predict/weather')
def weather_classification(data_path=WEATHER_DATA):
    with DBSession() as session:
        session.query(W_Music).delete()
        session.commit()
        music_features = session.query(Music_Feature).all()

    music_df = pd.DataFrame([mf.__dict__ for mf in music_features])

    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())
        
    weather_df = pd.DataFrame(data)
    weather_df = weather_df.dropna(axis=0)

    X = weather_df[['energy', 'dance_ability', 'valence', 'tempo']]
    y = weather_df['weather']

    gaussiannb = GaussianNB()
    gaussiannb.fit(X, y)

    pred_X = music_df[['energy', 'dance_ability', 'valence', 'tempo']]
    predicted_weather = gaussiannb.predict(pred_X)
    music_df['weather'] = predicted_weather


    for music_id, popularity, weather in zip(music_df['music_id'], music_df['popularity'], music_df['weather']):
        w_music = W_Music(music_id=music_id, popularity=popularity, weather_id=weather)
        session.add(w_music)

    try:
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"An error occurred while inserting data: {e}")

    return "success"

@app.route('/flask/recommend/<user_id>')
def favorite_song(user_id):
    
    with DBSession() as session:
        my_eigtheens = session.query(My_Eighteen).all()
    my_eigtheens_df = pd.DataFrame([mf.__dict__ for mf in my_eigtheens])
        
    user_music = pd.pivot_table(my_eigtheens_df, values='my_eighteen_id', index=['user_id'], columns='music_id', aggfunc=lambda x: 1 if len(x)>0 else 0, fill_value=0)
    user_music = user_music.reset_index() # add user_id as a column
    user_music = user_music.melt(id_vars=['user_id'], var_name='music_id', value_name='rating') # reshape the dataframe to fit Surprise format
    reader = Reader(rating_scale=(0, 1))
    data = Dataset.load_from_df(df=user_music, reader=reader)

    train = data.build_full_trainset()
    model = SVD(n_factors=100, n_epochs=20, random_state=123)
    model.fit(train)
    
    liked_songs = my_eigtheens_df.loc[(my_eigtheens_df['user_id'] == user_id), 'music_id'].tolist()
    all_songs = my_eigtheens_df.loc[~my_eigtheens_df['music_id'].isin(liked_songs), 'music_id'].tolist()
    scores = [(song, model.predict(user_id, song).est) for song in all_songs]
    recommendation_list = [score[0] for score in sorted(scores, key=lambda x: x[1], reverse=True)[:1000] if score[0] not in liked_songs]
    recommendation_list = list(set(recommendation_list))[:20]

    return recommendation_list

@app.route('/flask/recommend/emotion/<emotion_id>')
def emotion_recommend(emotion_id):
    with DBSession() as session:
        popular_e_musics = session.query(E_Music).filter(E_Music.emotion_id==emotion_id, E_Music.popularity>=30).all()
        recommended_e_musics = random.sample(popular_e_musics, k=20)
        result = []
        for music in recommended_e_musics:
            result.append(music.music_id)

    return result
    
@app.route('/flask/recommend/situation/<situation_id>')
def situation_recommend(situation_id):
    with DBSession() as session:
        popular_s_musics = session.query(S_Music).filter(S_Music.situation_id==situation_id, S_Music.popularity>=30).all()
        recommended_s_musics = random.sample(popular_s_musics, k=20)
        result = []
        for music in recommended_s_musics:
            result.append(music.music_id)

        return result
    
@app.route('/flask/recommend/weather/<weather_id>')
def weather_recommend(weather_id):
    with DBSession() as session:
        popular_w_musics = session.query(W_Music).filter(W_Music.weather_id==weather_id, W_Music.popularity>=40).all()
        recommended_w_musics = random.sample(popular_w_musics, k=20)
        result = []
        for music in recommended_w_musics:
            result.append(music.music_id)

    return result

if __name__ == "__main__" :
    app.run(host='0.0.0.0', debug=True)
