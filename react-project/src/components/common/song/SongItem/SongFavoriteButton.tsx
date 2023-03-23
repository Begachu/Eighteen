import React from "react";
import styled from "styled-components";
import { TbMusic } from "react-icons/tb";

interface Props {
  musicId: number;
  isEighteen: boolean;
  setEighteen: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * 음악 애창곡 등록 버튼 컴포넌트
 */
const SongFavoriteButton = ({ musicId, isEighteen, setEighteen }: Props): JSX.Element => {
  return (
    <StyledButton onClick={setEighteen}>
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

export default SongFavoriteButton;
