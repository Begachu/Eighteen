import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { IconButton } from "../common/button";
import { useParams } from "react-router";
import { useRecoilState } from "recoil";
import { authState } from "../../recoil/atom/authState";
import { getMusic } from "../../apis/music";
import axios from "axios";
import Loading from "../common/loading/Loading";
import { addEighteen, removeEighteen } from "../../apis/myEighteen";
import { addEighteenForSearch, removeEighteenForSearch } from "../../apis/search";

interface Song {
  musicId: number;
  title: string;
  singer: string;
  thumbnailUrl: string;
  isEighteen: boolean;
}

const SongDetailInfo = (): JSX.Element => {
  const { songid } = useParams();
  const [auth, setAuth] = useRecoilState(authState);
  const [data, setData] = useState<Song>();
  const loading = useRef<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      if (!songid) return;
      try {
        const { data } = await getMusic(+songid, auth.token);
        setData(data);
        // history에도 이를 추가합니다
        const songHistory: number[] = JSON.parse(localStorage.getItem("song-history") ?? "[]");
        localStorage.setItem(
          "song-history",
          JSON.stringify([data.musicId, ...songHistory.filter((item) => item !== data.musicId).splice(0, 9)]),
        );
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 401) {
            setAuth({ ...auth, token: "" });
          }
        }
      }
    };
    getData();
  }, []);

  const onClickYoutube = () => {
    window.location.href = `https://www.youtube.com/user/ziller/search?query=${songid}`;
  };

  const onDefaultImg = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `${process.env.PUBLIC_URL}/img/default_thumnail.png`;
  };

  const onToggle = async () => {
    if (!data) return;

    if (loading.current) return;
    loading.current = true;

    let success = false;
    try {
      if (data.isEighteen) {
        await removeEighteen([data.musicId], auth.token);
        await removeEighteenForSearch([{ id: data.musicId, title: data.title, singer: data.singer }], auth.token);
      } else {
        await addEighteen(data.musicId, auth.token);
        await addEighteenForSearch([{ id: data.musicId, title: data.title, singer: data.singer }], auth.token);
      }
      success = true;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          setAuth({ ...auth, token: "" });
        }
      }
    } finally {
      // 과도한 요청을 방지하기 위해 1초의 요청 간격을 줍니다
      await setTimeout(() => {
        loading.current = false;
      }, 500);
      if (success) setData({ ...data, isEighteen: !data.isEighteen });
    }
  };

  return (
    <StyledDiv>
      {Boolean(data) || (
        <div className="loading">
          <Loading />
        </div>
      )}
      <div className={`info ${Boolean(data) || "blur"}`}>
        <img src={data?.thumbnailUrl ?? `${process.env.PUBLIC_URL}/img/default_thumnail.png`} onError={onDefaultImg} />
        <div className="main-info">
          <IconButton type={"youtube"} onClick={onClickYoutube} />
          <div>
            <span className="music-id">{data?.musicId ?? "12345"}</span>
            <h1>{data?.title ?? "노래 제목란"}</h1>
            <span className="singer">{data?.singer ?? "가수명"}</span>
          </div>
          <IconButton type={"favorite"} active={data?.isEighteen} onClick={onToggle} />
        </div>
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  & > .loading {
    background-color: var(--black-opacity);
    position: absolute;
    z-index: 2;
    left: 0;
    top: 0;
    width: 100%;
    height: ${() => window.innerHeight - 80}px;
    display: flex;
    algin-items: center;
  }
  & > .blur {
    filter: blur(8px);
  }
  & > .info {
    margin-top: 144px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    & > img {
      width: 100%;
      max-width: 296px;
      aspect-ratio: 1;
      background-color: var(--black-opacity);
      border: 0;
      box-shadow: var(--shadow);
    }
    & > .main-info {
      margin-top: 24px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      & > div {
        text-align: center;
        & > .music-id {
          font-size: 16px;
          color: var(--blue-500);
          font-weight: 900;
        }
        & > .singer {
          font-size: 20px;
        }
        & > h1 {
          margin: 16px auto;
          font-size: 24px;
        }
      }
    }
  }
`;

export default SongDetailInfo;
