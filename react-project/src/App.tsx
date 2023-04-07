import axios from "axios";
import React, { useEffect } from "react";
import { Route, Routes } from "react-router";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { getMainData } from "./apis/main";
import { checkUser } from "./apis/oauth";
import { Logo } from "./components/common/logo";
import { NavBar } from "./components/common/nav";
import { Favorite, Home, Login, Mypage, Recommend, Song, SongDetail, Setting, Register } from "./pages";
import { userState } from "./recoil/atom";
import Loading from "./components/common/loading/Loading";
import { authState } from "./recoil/atom/authState";

const App = (): JSX.Element => {
  const [user, setUser] = useRecoilState(userState);
  const [auth, setAuth] = useRecoilState(authState);

  const { token, loading } = auth;

  useEffect(() => {
    // 최초 접근 시 main 요청을 통해 사용자 정보를 가져옵니다.
    const getAccessToken = async () => {
      setAuth((pre) => ({ ...pre, loading: true }));
      let nextToken = "";
      try {
        // 최초 접근 시 ACCESS TOKEN 발급을 위해 요청을 보냅니다
        const response = await checkUser();
        // CASE 1-1 : 200 ACCEPTED
        // 이 경우 발급받은 ACCESS TOKEN을 활용한 요청을 위해 callback 함수를 호출합니다
        nextToken = `Bearer ${response.headers["accesstoken"]}`;
      } catch (e) {
        // 요청 실패
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 401) {
            // CASE 1-2 : 401 UNAUTHORIZED
            // 이 경우 재 로그인이 필요하므로 로그인 화면으로 이동합니다
            setUser(null);
          }
        }
      } finally {
        setAuth({ token: nextToken, loading: false });
      }
    };

    const enterService = async () => {
      setAuth((pre) => ({ ...pre, loading: true }));
      try {
        const response = await getMainData(token);
        if (response.status === 204) {
          // CASE 2 : 204 NO_CONTENT
          // 이 경우 등록된 회원이나 정상적인 회원가입을 거치지 않은 유저입니다
          // 따라서 회원가입 화면으로 이동합니다
          setUser({
            birth: "1999-01-01",
            gender: "M",
            nickname: "",
            profileImage: "",
            newby: true,
          });
        } else if (response.status === 200) {
          // CASE 3 : 200 ACCEPTED
          // 이 경우 정상적으로 등록된 유저이으로 서비스 화면으로 이동합니다
          setUser(response.data);
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 401) {
            // CASE 1 : 401 UNAUTHORIZED
            // 이 경우 토큰이 만료되었거나, 로그인하지 않은 유저입니다
            // 최초의 경우 REFLESH TOKEN을 토대로 다시 한 번 ACCESS TOKEN을 발급합니다
            setAuth({ token: "", loading: false });
          }
        }
      } finally {
        setAuth((pre) => ({ ...pre, loading: false }));
      }
    };

    if (token) enterService();
    else getAccessToken();
  }, [token]);

  if (!user || user.newby) {
    return (
      <StyledDiv className="App">
        <div className="Page max-height" id="Page">
          <div className="logo">
            <Logo />
          </div>
          {loading && <Loading />}
          {loading || (!user ? <Login /> : <Register />)}
        </div>
      </StyledDiv>
    );
  } else {
    return (
      <StyledDiv className="App">
        <div className="Page" id="Page">
          <div className="logo">
            <Logo />
          </div>
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route path="/recommend/:type" element={<Recommend />} />
            <Route path="/song" element={<Song />} />
            <Route path="/song/:songid" element={<SongDetail />} />
            <Route path="/favorite" element={<Favorite />} />
            <Route path="/mypage" element={<Mypage />} />
            <Route path="/setting" element={<Setting />} />
          </Routes>
        </div>
        <NavBar />
      </StyledDiv>
    );
  }
};

const StyledDiv = styled.div`
  height: 100vh;
  z-index: 0;
  position: relative;
  /* background-color: red; */
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .max-height {
    height: 100vh !important;
    & > div {
      -webkit-animation: none !important;
      animation: none !important;
    }
  }

  // 실제 페이지 정보가 담길 페이지 컴포넌트
  & > .Page {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    overflow: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;

    & > div {
      -webkit-animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
      animation: fade-in-bottom 0.6s cubic-bezier(0.39, 0.575, 0.565, 1) both;
      & > div {
      }
      & > h1 {
      }
    }

    // 스크롤 디자인 CSS
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--blue-700);
      width: 8px;
      border-radius: 8px;
    }
    &::-webkit-scrollbar-track {
      background-color: none;
    }
    & > .logo {
      position: relative;
      overflow: visible;
      display: flex;
      justify-content: flex-end;
      & > div {
        margin: 56px 32px;
        box-sizing: border-box;
      }
    }
    & > * {
      box-sizing: border-box;
      width: 100%;
      max-width: 800px;
    }
  }

  // 그라데이션 효과
  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    top: -60px;
    left: 0;
    width: 100%;
    height: 240px;
    background: var(--gradation);
    filter: blur(80px);
    opacity: 0.75;
  }
`;

export default App;
