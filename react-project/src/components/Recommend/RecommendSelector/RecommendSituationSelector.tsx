import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { ToggleTextButton } from "../../common/button";

const RecommendSituationSelector = (): JSX.Element => {
  const [search, setSearch] = useSearchParams();

  useEffect(() => {
    if (!search.get("situation")) toggleSearch("1");
  }, []);

  const toggleSearch = (situation: string) => {
    setSearch({ situation }, { replace: true });
  };

  return (
    <StyledDiv>
      {situdationList.map((item, index) => (
        <ToggleTextButton
          key={index}
          text={item.text}
          onClick={() => toggleSearch(item.value)}
          active={search.get("situation") === item.value}
        />
      ))}
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  position: absolute;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  & > * {
    margin: 0 8px 8px 0;
  }
`;

const situdationList = [
  { text: "회식 분위기업", value: "1" },
  { text: "여행", value: "4" },
  { text: "데이트", value: "2" },
  { text: "결혼식 축가", value: "6" },
  { text: "이별", value: "5" },
  { text: "응원이 필요할때", value: "3" },
];

export default RecommendSituationSelector;
