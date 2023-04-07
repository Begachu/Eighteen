import os
import shutil

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
from yellowbrick.cluster import KElbowVisualizer
import json
from pandas import json_normalize
import numpy as np

DATA_DIR = "../data"
DATA_FILE = os.path.join(DATA_DIR, "results.json")

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
