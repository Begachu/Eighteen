import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export interface Props {
  rank: number;
  musicId: number;
  title: string;
  singer: string;
  thumbnailUrl: string;
}

/**
 * 노래 목록 아이템.
 * 좌측 버튼 클릭 시 좋아요 여부를 토글할 수 있으며
 * 컴포넌트 클릭 시 해당 노래 상세페이지로 이동합니다.
 */
const SongRankingItem = ({ rank, musicId, title, singer, thumbnailUrl }: Props): JSX.Element => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate(`/song/${musicId}`);
  };

  return (
    <StyledLi title={title} singer={singer} onClickCapture={onClick}>
      <div className="rank">{rank}</div>
      <img src={thumbnailUrl} />
      <div>
        <div className="number">
          <span>{musicId}</span>
        </div>
        <div className="title">
          <span>{title}</span>
        </div>
        <div className="singer">
          <span>{singer}</span>
        </div>
      </div>
    </StyledLi>
  );
};

const StyledLi = styled.li<{ title: string; singer: string }>`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  list-style: none;
  margin: 8px 0;
  border-radius: 16px;
  padding: 0 16px;
  height: 80px;
  background-color: var(--black-500);
  box-shadow: var(--shadow);
  cursor: pointer;

  & img {
    width: 72px;
    height: 72px;
    margin-right: 16px;
  }
  & > div:first-child {
    width: 32px;
    text-align: center;
    margin-right: 16px;
    font-size: 24px;
    font-weight: 900;
  }
  & > div:last-child {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    box-sizing: border-box;
    padding: 8px;
    overflow: hidden;

    & > div {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    & > .number {
      font-size: 14px;
      font-weight: 900;
      color: var(--blue-500);
    }
    & > .title {
      font-size: 16px;
      font-weight: 900;
    }
    & > .singer {
      font-size: 14px;
      font-weight: 400;
    }
  }
`;

export default SongRankingItem;
