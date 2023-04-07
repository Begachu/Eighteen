import React from "react";
import styled from "styled-components";
import { HomeHeader, HomeRecommendGrid } from "../components/Home";

/**
 * 홈
 */
const Home = (): JSX.Element => {
  return (
    <StyledDiv>
      <HomeHeader />
      <HomeRecommendGrid />
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 96px 16px 24px;
  & > * {
    -webkit-animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
    animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
    &:nth-child(2) {
      animation-delay: 0.2s;
      & > *:nth-child(odd) {
        -webkit-animation: fade-in-right 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        animation: fade-in-right 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        animation-delay: 0.4s;
      }
      & > *:nth-child(even) {
        -webkit-animation: fade-in-left 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        animation: fade-in-left 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
        animation-delay: 0.4s;
      }
    }
  }
`;

export default Home;
