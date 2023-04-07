import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { userState } from "../../recoil/atom";
import { TextButton } from "../common/button";

/**
 * 4번째 로그인 화면
 */
const RegisterFinalSilde = (): JSX.Element => {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userState);

  if (!user) return <></>;

  const onClick = () => {
    navigate("/");
    setUser({ ...user, newby: false });
  };

  return (
    <StyledDiv>
      <h1>모든 준비가 끝났어요!</h1>
      <h2>
        <span>이제 에이틴과 함께</span>
        <span>신나는 노래방 라이프를 즐기러 가볼까요?</span>
      </h2>
      <div className="button-area">
        <TextButton text={"시작하기"} color={"gradation"} onClick={onClick} />
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  overflow: hidden;
  position: relative;
  z-index: 1;
  & .button-area {
    animation-delay: 1s;
    position: fixed;
    left: 0;
    bottom: 96px;
    width: 100%;
    display: flex;
    justify-content: center;

    & > button {
      width: 100%;
      max-width: 300px;
      height: 80px;
    }
  }
`;
export default RegisterFinalSilde;
