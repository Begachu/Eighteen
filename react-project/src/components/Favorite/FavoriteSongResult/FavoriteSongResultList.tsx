import axios from "axios";
import { loadavg } from "os";
import React, { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { getEighteenList } from "../../../apis/myEighteen";
import { searchEighteenForSinger, searchEighteenForTitle } from "../../../apis/search";
import { authState } from "../../../recoil/atom/authState";
import { searchState } from "../../../recoil/atom/searchState";
import { Song, SongItem } from "../../common/song";
import FavoriteSongResultDefault from "./FavoriteSongResultDefault";
import FavoriteSongResultEmpty from "./FavoriteSongResultEmpty";
import FavoriteSongResultLoading from "./FavoriteSongResultLoading";

const FavoriteSongList = () => {
  const [list, setList] = useState<Song[]>([]);
  const [search, setSearch] = useRecoilState(searchState);
  const [auth, setAuth] = useRecoilState(authState);
  const maxPage = useRef<number>(0);

  useEffect(() => {
    maxPage.current = 0;
    setList([]);

    if (search.loading) return;
    setSearch((pre) => ({ ...pre, loading: true }));

    // 1초마다 한번씩 최종 변경된 사항으로 검색합니다
    setTimeout(() => {
      setSearch((pre) => {
        const { type, keyword, page } = pre;
        getData(type, keyword, page);
        return { ...pre };
      });
    }, 1000);
  }, [search.keyword, search.type]);

  // 애창곡 리스트 전체 함수
  const getTotalData = async (page: number) => {
    let result = false;
    try {
      const res = await getEighteenList(page, 20, auth.token);
      if (res.status === 200) {
        // CASE 2: 200 ACCEPTED
        maxPage.current = res.data.musicPage.totalPages;
        setList([...list, ...res.data.musicPage.content]);
        result = true;
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          // CASE 3: 401 UNAUTHORIZED
          setAuth({ ...auth, token: "" });
        }
      }
    } finally {
      setSearch((pre) => ({ ...pre, loading: false, page: result ? page + 1 : pre.page }));
    }
    return result;
  };

  // 애창곡 리스트 검색 함수
  const getData = async (type: string, keyword: string, page: number) => {
    let result = false;
    try {
      if (keyword) {
        const { data } =
          type === "title"
            ? await searchEighteenForTitle(keyword, page, 20, auth.token)
            : await searchEighteenForSinger(keyword, page, 20, auth.token);

        maxPage.current = data.total_page;

        if (data.music_list instanceof Array) {
          if (search.keyword === keyword && search.type === type) {
            setList((pre) => [
              ...pre,
              ...data.music_list.map((item: any) => ({
                musicId: item.id,
                title: item.title,
                singer: item.singer,
                isEighteen: item.preferable,
                thumnailUrl: item.thumbnail_url,
              })),
            ]);
          } else {
            setList([
              ...data.music_list.map((item: any) => ({
                musicId: item.id,
                title: item.title,
                singer: item.singer,
                isEighteen: item.preferable,
                thumnailUrl: item.thumbnail_url,
              })),
            ]);
          }
        }
        result = true;
      } else return getTotalData(page);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          setAuth({ ...auth, token: "" });
        }
      }
    } finally {
      setSearch((pre) => ({ ...pre, loading: false, page: result ? page + 1 : pre.page }));
    }
    return result;
  };

  return (
    <StyledDiv>
      {search.loading && <FavoriteSongResultLoading />}
      {search.loading || Boolean(list.length) || Boolean(search.keyword) || <FavoriteSongResultDefault />}
      {search.loading || Boolean(list.length) || (Boolean(search.keyword) && <FavoriteSongResultEmpty />)}
      <InfiniteScroll
        next={() => {
          if (search.loading) return;
          setSearch((pre) => ({ ...pre, loading: true }));
          getData(search.type, search.keyword, search.page);
        }}
        hasMore={search.page < maxPage.current}
        loader={<FavoriteSongResultLoading />}
        dataLength={list.length}
        scrollableTarget={"Page"}
      >
        {list.map((item, index) => (
          <SongItem
            key={index}
            musicId={item.musicId}
            title={item.title}
            singer={item.singer}
            isEighteen={item.isEighteen}
            thumbnailUrl={item.thumbnailUrl}
          />
        ))}
      </InfiniteScroll>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  & > h2 {
    font-weight: 400;
    margin-top: 40px;
  }
  & > ul {
    margin: 0;
    padding: 0;
    /* height: 80px; */
    display: flex;
    flex-direction: column;

    & > *:nth-child(n) {
      margin-top: 4px;
      animation: identifier 1s;
    }
    & > *:nth-child(5n) {
      /* margin-bottom: 32px; */
    }
  }
  @keyframes identifier {
    from {
      opacity: 0;
      margin-top: -8px;
    }
    to {
      opacity: 1;
      margin-top: 4px;
    }
  }
`;

export default FavoriteSongList;
