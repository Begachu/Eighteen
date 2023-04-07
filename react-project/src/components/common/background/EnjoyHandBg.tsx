import React, { useEffect, useState } from "react";
import styled from "styled-components";
import lottie from "lottie-web";
import animationData from "./boom.json";

interface Props {
  show: boolean;
}
type Status = "default" | "visible" | "hidden";

const EnjoyHandBg = ({ show }: Props): JSX.Element => {
  const [status, setStatus] = useState<Status>("default");

  useEffect(() => {
    if (show) setStatus("visible");
    else if (status === "visible") setStatus("hidden");
  }, [show]);

  useEffect(() => {
    const container = document.querySelector("#lottie-boom");
    if (container instanceof HTMLElement)
      lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: false,
        autoplay: true,
        animationData: animationData,
      });
  }, [status]);

  return (
    <StyledDiv className={status}>
      <img className="left" src={`${process.env.PUBLIC_URL}/img/hand1.png`} />
      <img className="right" src={`${process.env.PUBLIC_URL}/img/hand2.png`} />
      <div id="lottie-boom" />
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  margin: 80px calc((100% - 400px) / 2);
  max-width: 400px;
  -webkit-animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
  animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
  position: absolute;
  width: 100%;
  top: 0;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  &.default {
    display: none;
  }
  &.hidden {
    & > * {
      -webkit-animation: slide-out-bottom 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
      animation: slide-out-bottom 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
    }
  }
  &.visible {
    & > * {
      -webkit-animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
      animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
    }
    & .left {
      animation-delay: 0.2s;
    }
    & .right {
      animation-delay: 0.4s;
    }
  }
  & * {
    top: 0;
    position: absolute;
  }
  & .left {
    margin-top: 240px;
    width: 140%;
    max-width: 400px;
    left: -30%;
  }
  & .right {
    margin-top: 80px;
    width: 200%;
    max-width: 600px;
    right: -50%;
  }
  & > div {
    width: 100%;
    height: 100vh;
    z-index: -1;
  }
`;

export default EnjoyHandBg;
