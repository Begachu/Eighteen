import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { userState } from "../recoil/atom";
import styled from "styled-components";
import moment from "moment";
import { getProfile, getSongHistory } from "../apis/profile";
import { Profile } from "../components/mypage/profile";
import { SongHistory } from "../components/mypage/songHistory";

interface Music {
  isEighteen: boolean;
  musicId: number;
  singer: string;
  thumbnailUrl: string;
  title: string;
}

const musics: number[] = JSON.parse(localStorage.getItem("song-history") || "[]");

/*
 * 마이페이지
 */
const Mypage = (): JSX.Element => {
  const [user, setUser] = useRecoilState(userState);
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [dummyGender, setDummyGender] = useState<string>("none");

  useEffect(() => {
    async function getUser() {
      const { data } = await getProfile();
      console.log(data);
      setUser(data);
    }

    async function getHistory() {
      const { data } = await getSongHistory(musics);
      console.log(data);
      setMusicList(data);
    }

    if (user?.gender == "M") {
      setDummyGender("남성");
    } else if (user?.gender == "F") {
      setDummyGender("여성");
    }

    getUser();
    getHistory();
  }, []);

  let age = 0;

  /*
   *나이 계산
   */
  if (userState) {
    const today = moment(new Date());
    const birth = moment(`${user?.birth}`, "YYYY-MM-DD");
    age = today.diff(birth, "years");
  }

  return (
    <StyledDiv>
      <h1>마이페이지</h1>
      <div className="profileDiv">
        <Profile
          name={user?.nickname || "none"}
          age={age}
          gender={dummyGender || "none"}
          image={user?.profileImage || "none"}
        />
      </div>
      <div className="songHistoryDiv">
        <SongHistory musicList={musicList} />
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  box-sizing: border-box;
  padding: 96px 16px 80px;
  position: relative;

  ::-webkit-scrollbar {
    display: none;
  }

  & > h1 {
    font-weight: 400;
    font-size: 32px;
  }

  & .profileDiv {
    box-sizing: border-box;
    margin: 40px 0px 0px;
    padding: 0px 8px 0px;
  }

  & .songHistoryDiv {
    box-sizing: border-box;
    margin-top: 40px;
  }
`;

export default Mypage;
