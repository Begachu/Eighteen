import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { searchForSinger, searchForTitle } from "../../../apis/search";
import { authState } from "../../../recoil/atom/authState";
import { searchState } from "../../../recoil/atom/searchState";
import { Song, SongItem } from "../../common/song";
import SongResultDefault from "./SongResultDefault";
import SongResultEmpty from "./SongResultEmpty";
import SongResultLoading from "./SongResultLoading";
import InfiniteScroll from "react-infinite-scroll-component";

interface Props {
  scrollId?: string;
}

const SongResultList = ({ scrollId = "Page" }: Props): JSX.Element => {
  const [list, setList] = useState<Song[]>([]);
  const [search, setSearch] = useRecoilState(searchState);
  const [auth, setAuth] = useRecoilState(authState);
  const maxPage = useRef<number>(0);

  useEffect(() => {
    maxPage.current = 0;
    setList([]);

    if (search.loading || !search.keyword) return;
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

  const getData = async (type: string, keyword: string, page: number) => {
    let result = false;
    try {
      const { data } =
        type === "title"
          ? await searchForTitle(keyword, page, 20, auth.token)
          : await searchForSinger(keyword, page, 20, auth.token);

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
        result = true;
      }
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
      <h2>검색 결과</h2>
      {search.loading && <SongResultLoading />}
      {search.loading || Boolean(list.length) || Boolean(search.keyword) || <SongResultDefault />}
      {search.loading || Boolean(list.length) || (Boolean(search.keyword) && <SongResultEmpty />)}
      <InfiniteScroll
        next={() => {
          if (search.loading) return;
          setSearch((pre) => ({ ...pre, loading: true }));
          getData(search.type, search.keyword, search.page);
        }}
        hasMore={search.page < maxPage.current}
        loader={<SongResultLoading />}
        dataLength={list.length}
        scrollableTarget={scrollId}
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

export default SongResultList;
