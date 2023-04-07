import React from "react";
import styled from "styled-components";
import SongSample from "../../../utils/sample/song.json";
import Loading from "../../common/loading/Loading";
import { SongItem } from "../../common/song";

const RecommendLoading = (): JSX.Element => {
  return (
    <StyledDiv>
      <ul>
        {SongSample.data.map((item, index) => (
          <SongItem
            key={index}
            musicId={item.musicId}
            title={item.title}
            singer={item.singer}
            isEighteen={item.isEighteen}
            thumbnailUrl={item.thumbnailUrl}
          />
        ))}
      </ul>
      <div>
        <Loading />
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  position: relative;
  & > div {
    position: absolute;
    top: 40%;
    left: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    line-height: 24px;
    & img {
      width: 40%;
      transform: rotate(60deg);
    }
    & p {
      margin: 0;
    }
  }
  & > ul {
    pointer-events: none;
    filter: blur(4px);
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
`;

export default RecommendLoading;
