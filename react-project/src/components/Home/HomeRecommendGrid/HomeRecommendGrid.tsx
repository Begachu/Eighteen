import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { getWeather } from "../../../apis/weather";
import { weatherState } from "../../../recoil/atom/weatherState";

const HomeRecommendGrid = (): JSX.Element => {
  const [weather, setWeather] = useRecoilState(weatherState);
  const navigate = useNavigate();

  useEffect(() => {
    // 날씨 정보가 아직 없으면 데이터를 받아옵니다
    if (!weather) getWeather().then((data) => setWeather(data));
  }, [weather]);

  const onClickRecommend = (e: React.MouseEvent<HTMLButtonElement>) => {
    const type = e.currentTarget.value;
    navigate(`/recommend/${type}`);
  };

  return (
    <StyledDiv>
      <div>
        <button value={"my_eighteen"} onClick={onClickRecommend}>
          <img src={`${process.env.PUBLIC_URL}/img/my_eighteen.png`} />
          <span>취향맞춤 추천</span>
          <h2>
            너도 몰랐던
            <br />
            너의 에이틴
          </h2>
        </button>

        <button value={"weather"} onClick={onClickRecommend}>
          <span>날씨 기반 추천</span>
          {weather?.img && <img src={weather.img} />}
          <h2>
            오늘 같은
            <br />
            날씨엔
          </h2>
        </button>
      </div>
      <div>
        <button value={"ranking"} onClick={onClickRecommend}>
          <img src={`${process.env.PUBLIC_URL}/img/ranking.png`} />
          <span>다들 뭐부를까?</span>
          <h2>
            성별·나이별
            <br />
            애창곡 랭킹
          </h2>
        </button>
      </div>
      <div>
        <button value={"emotion"} onClick={onClickRecommend}>
          <img src={`${process.env.PUBLIC_URL}/img/emotion.png`} />
          <span>감정 기반 추천</span>
          <h2>
            지금 너의
            <br />
            기분은?
          </h2>
        </button>

        <button value={"situation"} onClick={onClickRecommend}>
          <img src={`${process.env.PUBLIC_URL}/img/situation.png`} />
          <span>상황 기반 추천</span>
          <h2>
            회식도 모임도
            <br />
            자신있게!
          </h2>
        </button>
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  & div {
    width: 100%;
    display: flex;
    flex: 1 1 0;
    margin-bottom: 2px;
  }

  & div:nth-child(2) > button {
    height: 144px;
    text-align: right;
    align-items: end;
    justify-content: center;
    padding-right: 32px;
  }
  & button {
    position: relative;
    overflow: hidden;
    border: 0;
    border-radius: 16px;
    margin: 4px;
    padding: 16px;
    width: 100%;
    height: 160px;
    font: inherit;
    display: flex;
    justify-content: end;
    flex-direction: column;
    text-align: left;
    color: var(--black-50);
    background-color: var(--black-500);
    box-shadow: var(--shadow);
    & > * {
      z-index: 1;
      position: relative;
    }

    & > img {
      width: 100%;
      height: 100%;
      z-index: 0;
      position: absolute;
      top: 0;
      left: 0;
      background-position: center;
      object-fit: cover;
      opacity: 0.5;
    }
  }
  & h2 {
    font-size: 24px;
    font-weight: 900;
    word-break: keep-all;
    margin: 0;
    margin-top: 4px;
  }
`;

export default HomeRecommendGrid;
