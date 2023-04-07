import React, { useState } from "react";
import styled from "styled-components";
import RegisterFavoriteInput from "./RegisterFavoriteInput";
import { FavoriteSongResult } from "../../Favorite";
import RegisterSearchModal from "../RegisterSearchModal/RegisterSearchModal";
import { TextButton } from "../../common/button";
import { useRecoilValue } from "recoil";
import { userState } from "../../../recoil/atom";

interface Props {
  nextPage(): void;
}

const RegisterFavoriteSetting = ({ nextPage }: Props): JSX.Element => {
  const user = useRecoilValue(userState);
  const [modal, setModal] = useState<boolean>(false);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setModal(true);
  };
  return (
    <StyledDiv>
      <h1>
        <span>
          <b>{user?.nickname}</b>님의
        </span>
        <span>애창곡은 무엇인가요?</span>
      </h1>
      <h2>
        <span>더 정확한 추천을 위해</span>
        <span>애창곡 정보를 등록해주세요</span>
      </h2>
      <div className="search-button" onClickCapture={onClick}>
        <RegisterFavoriteInput />
      </div>
      <FavoriteSongResult />
      <RegisterSearchModal show={modal} close={() => setModal(false)} />
      <div className="next-button">
        <TextButton text={"다음단계로 →"} color={"blue"} onClick={nextPage} />
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  & > .search-button {
    margin: 56px 0 32px;
    color: var(--black-50);
    width: 100%;
    border: 0;
    padding: 0;
    background: none;
    & > * {
      pointer-events: none;
    }
  }
  & > .next-button {
    width: 100%;
    margin: 64px 0;
    padding-bottom: 80px;
    display: flex;
    justify-content: center;
  }
`;

export default RegisterFavoriteSetting;
