import os
import shutil

import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
import json
from pandas import json_normalize
import numpy as np
from sklearn.tree import DecisionTreeClassifier

from surprise import SVD
from surprise import Reader, Dataset

from sklearn.svm import SVC
from sklearn import svm
from sklearn import preprocessing

from sklearn.naive_bayes import GaussianNB

import random

DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "results.json")
DATA_FILE2 = os.path.join(DATA_DIR, "emotions.json")
DATA_FILE3 = os.path.join(DATA_DIR, "favorite_musics.json")
DATA_FILE4 = os.path.join(DATA_DIR, "situations.json")
DATA_FILE5 = os.path.join(DATA_DIR, "weathers.json")

music_columns = (
    "id",
    "title",
    "singer",
    "thumbnail_url", 
    "popularity", 
    "danceability",
    "energy",
    "valence",
    "key",
    "tempo"
)

def kmeans_clustering(data_path=DATA_FILE):
    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())

    df = pd.DataFrame(data)
    df = df.replace('', np.NaN)
    df = df.dropna(axis=0)

    mood_df = df[['danceability', 'energy', 'valence']]

    scaler = MinMaxScaler()
    mood_df_scaled = scaler.fit_transform(mood_df)

    k = 3
    kmeans = KMeans(n_clusters = k, random_state = 10)
    kmeans.fit(mood_df_scaled)
    df['cluster'] = kmeans.fit_predict(mood_df_scaled)

    data = {'danceability': 0.8, 'energy': 0.6, 'valence': 0.9}
    predict_df = pd.DataFrame([data])

    predict_mood_df = predict_df[['danceability', 'energy', 'valence']]
    new_mood_df_scaled = scaler.transform(predict_mood_df)
    mood = kmeans.predict(new_mood_df_scaled)

    return mood

def emotion_classification(data_path=DATA_FILE, data_path2=DATA_FILE2):
    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())

    music_df = pd.DataFrame(data)
    music_df = music_df.replace('', np.NaN)
    music_df = music_df.dropna(axis=0)

    with open(data_path2, encoding="utf-8") as f:
        data2 = json.loads(f.read())
        
    emotion_df = pd.DataFrame(data2)
    emotion_df = emotion_df.dropna(axis=0)

    df = pd.merge(music_df, emotion_df, on=["title", "singer"])

    X = df[['energy', 'danceability', 'tempo']]
    y = df['emotion']


    clf = DecisionTreeClassifier()
    clf.fit(X, y)

    pred_X = music_df[['energy', 'danceability', 'tempo']]
    predicted_emotion = clf.predict(pred_X)
    predicted_emotion

    return predicted_emotion

def favorite_song(data_path=DATA_FILE, data_path3=DATA_FILE3):
    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())
    
    music_df = pd.DataFrame(data)
    music_df = music_df.replace('', np.NaN)
    music_df = music_df.dropna(axis=0)

    with open(data_path3, encoding="utf-8") as f:
        data2 = json.loads(f.read())

    favorite_df = pd.DataFrame(data2)
    favorite_df = favorite_df.dropna(axis=0)
    favorite_df = favorite_df[['user_id', 'title', 'liked']]

    reader = Reader(rating_scale=(0, 1))
    data = Dataset.load_from_df(df=favorite_df, reader=reader)

    train = data.build_full_trainset()

    model = SVD(n_factors=100, n_epochs=20, random_state=123)
    model.fit(train)

    user_list = favorite_df['user_id'].unique()
    recommendations = {}

    for user_id in user_list:
        liked_songs = favorite_df.loc[(favorite_df['user_id'] == user_id) & (favorite_df['liked'] == 1), 'id'].tolist()
        all_songs = favorite_df.loc[~favorite_df['id'].isin(liked_songs), 'id'].tolist()

        scores = [(song, model.predict(user_id, song).est) for song in all_songs]
        recommendation_list = [score[0] for score in sorted(scores, key=lambda x: x[1], reverse=True)[:20] if score[0] not in liked_songs]
    
    return recommendation_list


def situation_classification(data_path=DATA_FILE, data_path4=DATA_FILE4):
    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())
    
    music_df = pd.DataFrame(data)
    music_df = music_df.replace('', np.NaN)
    music_df = music_df.dropna(axis=0)

    with open(data_path4, encoding="utf-8") as f:
        data2 = json.loads(f.read())

    df = pd.DataFrame(data2)
    df = df.dropna(axis=0)

    X = df[['energy', 'danceability', 'tempo']]
    y = df['situation']

    scaler = preprocessing.StandardScaler()
    X = scaler.fit_transform(X)

    svm_clf = svm.SVC()
    svm_clf.fit(X, y)

    pred_X = music_df[['energy', 'danceability', 'tempo']]
    pred_X = scaler.transform(pred_X)
    predicted_situation = svm_clf.predict(pred_X)
    
    return predicted_situation

def weather_classification(data_path=DATA_FILE, data_path5=DATA_FILE5):
    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())

    music_df = pd.DataFrame(data)
    music_df = music_df.replace('', np.NaN)
    music_df = music_df.dropna(axis=0)

    with open(data_path5, encoding="utf-8") as f:
        data2 = json.loads(f.read())
        
    df = pd.DataFrame(data2)
    df = df.dropna(axis=0)

    X = df[['energy', 'danceability', 'valence', 'tempo']]
    y = df['weather']


    gaussiannb = GaussianNB()
    gaussiannb.fit(X, y)

    pred_X = music_df[['energy', 'danceability', 'valence', 'tempo']]
    predicted = gaussiannb.predict(pred_X)

    return predicted


def recommend_song_by_emotion(emotion, data_path=DATA_FILE, data_path2=DATA_FILE2):
    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())

    music_df = pd.DataFrame(data)
    music_df = music_df.replace('', np.NaN)
    music_df = music_df.dropna(axis=0)

    with open(data_path2, encoding="utf-8") as f:
        data2 = json.loads(f.read())
        
    df = pd.DataFrame(data2)
    df = df.dropna(axis=0)

    X = df[['energy', 'danceability', 'tempo']]
    y = df['emotion']

    clf = DecisionTreeClassifier()
    clf.fit(X, y)

    pred_X = music_df[['energy', 'danceability', 'tempo']]
    predicted_emotion = clf.predict(pred_X)
    music_df['emotion'] = predicted_emotion


    selected = music_df.loc[(music_df['emotion'] == emotion) & (music_df['popularity'] >= 30), 'id']
    result = random.sample(selected.tolist(), 20)
    
    return result

def recommend_song_by_situation(situation, data_path=DATA_FILE, data_path4=DATA_FILE4):
    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())
    
    music_df = pd.DataFrame(data)
    music_df = music_df.replace('', np.NaN)
    music_df = music_df.dropna(axis=0)

    with open(data_path4, encoding="utf-8") as f:
        data2 = json.loads(f.read())

    df = pd.DataFrame(data2)
    df = df.dropna(axis=0)

    X = df[['energy', 'danceability', 'tempo']]
    y = df['situation']

    scaler = preprocessing.StandardScaler()
    X = scaler.fit_transform(X)

    svm_clf = svm.SVC()
    svm_clf.fit(X, y)

    pred_X = music_df[['energy', 'danceability', 'tempo']]
    pred_X = scaler.transform(pred_X)
    predicted_situation = svm_clf.predict(pred_X)
    music_df['situation'] = predicted_situation
    
    music_df.loc[(music_df['situation'] == 1) & (music_df['tempo'] >= 167), 'situation'] = 1
    music_df.loc[(music_df['situation'] == 2) & (music_df['tempo'] >= 90), 'situation'] = 2
    music_df.loc[(music_df['situation'] == 3) & (music_df['tempo'] >= 179), 'situation'] = 3
    music_df.loc[(music_df['situation'] == 4) & (music_df['tempo'] >= 109), 'situation'] = 4

    date_words = ['사랑']
    travel_words = ['여행']
    breakup_words = ['이별']
    wedding_words = ['결혼', '청혼']

    for i, title in enumerate(music_df['title']):
        if any(word in title for word in date_words):
            music_df.loc[i, 'situation'] = 2
        elif any(word in title for word in travel_words):
            music_df.loc[i, 'situation'] = 4
        elif any(word in title for word in breakup_words):
            music_df.loc[i, 'situation'] = 5
        elif any(word in title for word in wedding_words):
            music_df.loc[i, 'situation'] = 6


    selected = music_df.loc[(music_df['situation'] == situation) & (music_df['popularity'] >= 30), 'id']
    result = random.sample(selected.tolist(), 20)
    
    return result


def recommend_song_by_weather(weather, data_path=DATA_FILE, data_path5=DATA_FILE5):
    with open(data_path, encoding="utf-8") as f:
        data = json.loads(f.read())

    music_df = pd.DataFrame(data)
    music_df = music_df.replace('', np.NaN)
    music_df = music_df.dropna(axis=0)

    with open(data_path5, encoding="utf-8") as f:
        data2 = json.loads(f.read())
        
    df = pd.DataFrame(data2)
    df = df.dropna(axis=0)

    X = df[['energy', 'danceability', 'valence', 'tempo']]
    y = df['weather']


    gaussiannb = GaussianNB()
    gaussiannb.fit(X, y)

    pred_X = music_df[['energy', 'danceability', 'valence', 'tempo']]
    predicted = gaussiannb.predict(pred_X)
    music_df['weather'] = predicted


    selected = music_df.loc[(music_df['weather'] == weather) & (music_df['popularity'] >= 40), 'id']
    result = random.sample(selected.tolist(), 20)
    
    return result

