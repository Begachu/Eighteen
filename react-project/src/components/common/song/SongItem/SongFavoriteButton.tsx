import React, { useRef } from "react";
import styled from "styled-components";
import { TbMusic } from "react-icons/tb";
import { addEighteen, removeEighteen } from "../../../../apis/myEighteen";
import { useRecoilState } from "recoil";
import { authState } from "../../../../recoil/atom/authState";
import axios from "axios";
import { addEighteenForSearch, removeEighteenForSearch } from "../../../../apis/search";

interface Props {
  musicId: number;
  singer: string;
  title: string;
  isEighteen: boolean;
  setEighteen(bool: boolean): void;
  onCustomClick?(): void;
}

/**
 * 음악 애창곡 등록 버튼 컴포넌트
 */
const SongFavoriteButton = ({ musicId, singer, title, isEighteen, setEighteen, onCustomClick }: Props): JSX.Element => {
  const [auth, setAuth] = useRecoilState(authState);
  const loading = useRef<boolean>(false);

  const onToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // 사용자 지정 클릭 이벤트가 있는 경우 요청 대신 이를 수행합니다
    if (onCustomClick) {
      onCustomClick();
      return;
    }

    if (loading.current) return;
    loading.current = true;

    let success = false;
    try {
      if (isEighteen) {
        await removeEighteen([musicId], auth.token);
        await removeEighteenForSearch([{ id: musicId, singer, title }], auth.token);
      } else {
        await addEighteen(musicId, auth.token);
        await addEighteenForSearch([{ id: musicId, singer, title }], auth.token);
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
      if (success) setEighteen(!isEighteen);
    }
  };

  return (
    <StyledButton onClick={onToggle}>
      {!isEighteen || <div className="gradation-bg" />}
      <TbMusic />
    </StyledButton>
  );
};

const StyledButton = styled.button`
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 20px;
  padding: 0;
  position: relative;
  overflow: hidden;
  background-color: var(--black-400);
  box-shadow: inset 0px 4px 16px rgba(0, 0, 0, 0.25);

  & > svg {
    position: absolute;
    top: 8px;
    left: 7px;
    font-size: 24px;
    display: block;
    margin: auto;
    color: var(--black-50);
  }

  & > .gradation-bg {
    -webkit-animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    top: -10px;
    left: -10px;
    background: var(--gradation);
    filter: blur(4px);
  }

  // keyframes
  @-webkit-keyframes scale-in-center {
    0% {
      -webkit-transform: scale(0);
      opacity: 0;
      transform: scale(0);
      opacity: 1;
      filter: blur(16px);
    }
    100% {
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
      opacity: 1;
      filter: blur(4px);
    }
  }
  @keyframes scale-in-center {
    0% {
      opacity: 0;
      -webkit-transform: scale(0);
      transform: scale(0);
      opacity: 1;
      filter: blur(16px);
    }
    100% {
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
      opacity: 1;
      filter: blur(4px);
    }
  }
`;

export default React.memo(SongFavoriteButton);
