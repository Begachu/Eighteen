import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { RecommendType } from "..";
import { Weather } from "../../../recoil/atom/weatherState";
import { BackButton } from "../../common/button";

interface Header {
  type: RecommendType;
  span: string;
  header: string;
}

interface Props {
  weather: Weather;
}

const RecommendHeader = ({ weather }: Props): JSX.Element => {
  const { type } = useParams();

  // header 정보
  const header = useMemo(() => {
    const res = HEADER_TEXT.find((item) => item.type === type);
    if (res) return res;
    return HEADER_TEXT[0];
  }, [type]);

  // 이미지
  const imgUrl = useMemo(() => {
    switch (header.type) {
      case "my_eighteen":
        return `${process.env.PUBLIC_URL}/img/my_eighteen.png`;
      case "ranking":
      case "emotion":
      case "situation":
        return `${process.env.PUBLIC_URL}/img/${header.type}.png`;
      case "weather":
        return weather.img;
    }
  }, [header]);

  return (
    <StyledHeader>
      <div className="back-button">
        <BackButton />
      </div>
      <img src={imgUrl} />
      <h1>노래 추천 화면</h1>
      <h2>
        <span>{header.span}</span>
        {header.header}
      </h2>
    </StyledHeader>
  );
};

const HEADER_TEXT: Header[] = [
  { type: "my_eighteen", span: "취향맞춤 추천", header: "너도 몰랐던\n너의 에이틴" },
  { type: "weather", span: "날씨기반 추천", header: "오늘 같은\n날씨엔" },
  { type: "ranking", span: "다들 뭐부를까?", header: "성별·나이별\n애창곡 랭킹" },
  { type: "emotion", span: "감정기반 추천", header: "지금 너의\n기분은?" },
  { type: "situation", span: "상황기반 추천", header: "회식도 모임도\n자신있게!" },
];

const StyledHeader = styled.header`
  padding: 16px 16px 0;
  & h1 {
    display: block;
    height: 0;
    overflow: hidden;
  }
  & h2 {
    display: flex;
    flex-direction: column;
    white-space: pre-line;
  }
  & span {
    font-size: 16px;
    font-weight: 400;
    margin-bottom: 4px;
  }
  & > * {
    z-index: 1;
    position: relative;
  }
  & img {
    z-index: -1;
    position: fixed;
    top: -32px;
    left: 0;
    width: 100vw;
    height: 352px;
    background-position: center;
    object-fit: cover;
    opacity: 1;
    -webkit-mask-image: linear-gradient(to top, transparent 0.1%, black 100%);
    mask-image: linear-gradient(to top, transparent 0.1%, black 100%);
  }
  & > .back-button {
    position: absolute;
    top: 48px;
  }
`;

export default RecommendHeader;
