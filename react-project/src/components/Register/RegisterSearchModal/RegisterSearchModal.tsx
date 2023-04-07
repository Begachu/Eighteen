import React, { useEffect, useState } from "react";
import styled from "styled-components";
import RegisterFavoriteInput from "../RegisterFavoriteSetting/RegisterFavoriteInput";
import { SongResultList } from "../../Song";
import { TbX } from "react-icons/tb";
import { useRecoilState } from "recoil";
import { searchState } from "../../../recoil/atom/searchState";

interface Props {
  show: boolean;
  close(): void;
}

type Status = "default" | "visible" | "hidden";

const RegisterSearchModal = ({ show, close }: Props): JSX.Element => {
  const [status, setStatus] = useState<Status>("hidden");
  const [, setSearch] = useRecoilState(searchState);

  useEffect(() => {
    if (show) setStatus("visible");
    else if (status === "visible") setStatus("hidden");
  }, [show]);

  const onClose = () => {
    setSearch({ keyword: "", type: "title", loading: false, page: 0 });
    close();
  };
  return (
    <StyledDiv className={status} id="modal">
      <div>
        <div className="background" />
        <button className="close-button" onClick={onClose}>
          <TbX />
        </button>
        <RegisterFavoriteInput />
        <SongResultList scrollId="modal" />
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  overflow: auto;
  transition: all 0.2s;
  box-sizing: border-box;
  padding: 16px 16px;
  position: fixed;
  background-color: var(--black-900);
  width: 100%;
  height: 100vh;
  z-index: 1;
  top: 100%;
  left: 0;

  &.hidden {
    top: 100%;
  }
  &.visible {
    top: 0;
  }
  & > div {
    display: flex;
    flex-direction: column;
    margin: auto;
    width: 100%;
    max-width: 800px;
    & > .background {
      position: sticky;
      top: 0;
      left: 0;
      z-index: 1;
      overflow: visible;
      &::after {
        position: absolute;
        background: linear-gradient(to top, transparent 0.1%, var(--black-900));
        content: "";
        z-index: -1;
        width: calc(100% + 32px);
        height: 240px;
        top: -16px;
        left: -16px;
      }
    }

    & > .close-button {
      position: sticky;
      top: 32px;
      z-index: 1;
      align-self: end;
      margin: 32px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 68px;
      min-height: 68px;
      font-size: 40px;
      background-color: var(--black-opacity);
      color: var(--black-50);
      border: 0;
      border-radius: 50%;
    }
    & > div:nth-child(3) {
      position: sticky;
      top: 132px;
      z-index: 1;
    }
    & > div:last-child {
      padding-bottom: 60px;
    }
  }
  // scroll CSS
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--blue-700);
    width: 8px;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-track {
    background-color: #00000080;
  }
`;

export default RegisterSearchModal;
