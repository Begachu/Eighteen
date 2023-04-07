import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SongFavoriteButton from "./SongFavoriteButton";

export interface Props {
  musicId: number;
  title: string;
  singer: string;
  thumbnailUrl: string;
  isEighteen: boolean;
  onCustomClick?(): void;
  onFavoriteBtnClick?(): void;
}

/**
 * 노래 목록 아이템.
 * 좌측 버튼 클릭 시 좋아요 여부를 토글할 수 있으며
 * 컴포넌트 클릭 시 해당 노래 상세페이지로 이동합니다.
 */
const SongItem = ({ musicId, title, singer, isEighteen, onCustomClick, onFavoriteBtnClick }: Props): JSX.Element => {
  const navigate = useNavigate();
  const [eighteen, setEighteen] = useState<boolean>(isEighteen);

  const onClick = () => {
    if (onCustomClick) onCustomClick();
    else navigate(`/song/${musicId}`);
  };

  return (
    <StyledLi title={title} singer={singer} onClick={onClick}>
      <SongFavoriteButton
        isEighteen={eighteen}
        musicId={musicId}
        title={title}
        singer={singer}
        setEighteen={setEighteen}
        onCustomClick={onFavoriteBtnClick}
      />
      <div className="number">
        <span>{musicId}</span>
      </div>
      <div className="title">
        <span>{title}</span>
      </div>
      <div className="singer">
        <span>{singer}</span>
      </div>
    </StyledLi>
  );
};

const StyledLi = styled.li<{ title: string; singer: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  list-style: none;
  margin: 8px 0;
  border-radius: 16px;
  padding: 0 16px;
  height: 60px;
  background-color: var(--black-500);
  box-shadow: var(--shadow);
  cursor: pointer;

  & > div {
    position: relative;
    overflow: hidden;
    margin-right: 16px;
    height: 100%;
    display: flex;
    align-items: center;
  }
  & > div > span {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    text-align: justify;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  & .number {
    flex: 1 1 1;
    width: 60px;
    color: var(--blue-500);
    font-weight: 900;
    margin-left: 16px;
  }
  & .title {
    flex: 2 1 0;
    font-weight: 700;
  }
  & .singer {
    flex: 1 1 0;
    font-size: 14px;
  }

  & > div:hover > span {
    animation: textsilde linear 5s forwards;
    min-width: 100%;
    width: inherit;
  }

  @keyframes textsilde {
    from {
      left: 0;
      transform: translateX(0);
    }
    to {
      left: 100%;
      transform: translateX(-100%);
    }
  }
`;

export default SongItem;
