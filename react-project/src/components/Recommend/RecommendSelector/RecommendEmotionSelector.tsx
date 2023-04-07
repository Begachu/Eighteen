import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

const RecommendEmotionSelector = (): JSX.Element => {
  const [search, setSearch] = useSearchParams();

  useEffect(() => {
    if (!search.get("emotion")) toggleSearch("1");
  }, []);

  const toggleSearch = (emotion: string) => {
    setSearch({ emotion }, { replace: true });
  };

  return (
    <StyledDiv pointer={emotionList.findIndex((item) => item.value === search.get("emotion"))}>
      <div className="pointer" />
      {emotionList.map((item, index) => (
        <button key={index} onClick={() => toggleSearch(item.value)}>
          {item.text}
        </button>
      ))}
    </StyledDiv>
  );
};

const StyledDiv = styled.div<{ pointer: number }>`
  overflow: hidden;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 8px);
  display: flex;
  background-color: var(--black-600);
  border-radius: 26px;
  padding: 4px;
  & > button {
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    height: 40px;
    flex: 1 1 0;
    font: inherit;
    color: var(--black-50);
    background: none;
    margin: 2px;
    border: none;
    border-radius: 20px;
    padding: 0;
  }
  & > .pointer {
    position: absolute;
    z-index: 0;
    background-color: var(--blue-500);
    height: 44px;
    left: ${({ pointer }) => `calc(${25 * pointer}% + 4px - 2 * ${pointer}px)`};
    width: calc(25% - 2px);
    border-radius: 22px;
    transition: all 0.2s;
  }
`;

const emotionList = [
  { text: "기쁨", value: "1" },
  { text: "슬픔", value: "2" },
  { text: "분노", value: "3" },
  { text: "사랑", value: "4" },
];

export default RecommendEmotionSelector;
