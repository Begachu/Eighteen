import React from "react";
import styled from "styled-components";
import { KakaoLoginButton, GoogleLoginButton, NaverLoginButton } from "../button";

/**
 * 4번째 로그인 화면
 */
const Login = (): JSX.Element => {
  return (
    <StyledDiv>
      <h1>너도 몰랐던 너의 에이틴</h1>
      <p>
        <span>에이틴과 함께</span>
        <span>신나는 노래방 라이프를 즐기러 가볼까요?</span>
      </p>
      <div className="buttonDiv">
        <KakaoLoginButton />
        <GoogleLoginButton />
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  .buttonDiv {
    animation-delay: 1s;
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 12vh;
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    & > * {
      max-width: 400px;
    }
  }
`;
export default Login;
