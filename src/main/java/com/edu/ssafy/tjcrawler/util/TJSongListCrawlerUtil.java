package com.edu.ssafy.tjcrawler.util;

import com.edu.ssafy.tjcrawler.dto.SongInfoDTO;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class TJSongListCrawlerUtil {
    static private ObjectMapper objectMapper;

    static {
        objectMapper = new ObjectMapper();
        objectMapper.enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);
    }

    static public String searchByNewSong(int year, int mon) {
        return String.format("http://m.tjmedia.co.kr/tjsong/song_monthNew.asp?YY=%d&MM=%02d", year, mon);
    }

    static public String searchByArtist(String artist) {
        return String.format("http://m.tjmedia.co.kr/tjsong/song_search_result.asp?strType=2&natType=&strCond=0&strSize02=10000&strText=%S", artist);
    }

    static public List<SongInfoDTO> crawling(String url) throws IOException {
        Document doc = Jsoup.connect(url).get();


        Element element = doc.select("#BoardType1").get(0);
        Elements tr = element.select("table>tbody>tr");
        List<SongInfoDTO> songInfos = new LinkedList<>();

        for (int i = 1;i < tr.size();i++) {
            Element el = tr.get(i);
            if (el.select("td").size() < 2) continue;

            songInfos.add(
                    SongInfoDTO.builder()
                            .id(el.select("td").get(0).text())
                            .title(el.select("td").get(1).text())
                            .singer(el.select("td").get(2).text())
                            .youtube_url("https://www.youtube.com/user/ziller/search?query=" + el.select("td").get(0).text() + " ")
                            .build()
            );
        }

        return songInfos.isEmpty()? null : songInfos;
    }

    static public List<SongInfoDTO> crawlingHiddenSongs(List<SongInfoDTO> songInfos) throws IOException {
        Set<String> artists_list = new HashSet<>();
        // songInfos 탐색해서 가수 넣기 + ','으로 가수 String parse후 양옆으로 trim후(왼쪽끝 공백 혹은 오른쪽끝 공백) 또 넣기
        /// 그래도 안찾아지는 노래는 걍 내버려둬
        Set<String> alreadyExits_songs = new HashSet<>();
        List<SongInfoDTO> newSongs = new LinkedList<>();

        songInfos.forEach((tmp) -> {
            alreadyExits_songs.add(tmp.getId());
            artists_list.add(tmp.getSinger());

            if (tmp.getSinger().contains(",")) {
                StringTokenizer st = new StringTokenizer(tmp.getSinger(), ",");

                while (st.hasMoreTokens()) {
                    String artist = st.nextToken();
                    artists_list.add(artist);
                }
            }
        });


        // artists_list를 사용해서 가수 검색으로 노래 찾기
        /// Map을 사용해서 같은 id값을 갖는건 중복처리
        AtomicLong indexHolder = new AtomicLong();
        artists_list.forEach((artist) -> {
            System.out.println(1 + indexHolder.getAndIncrement() + " / " + artists_list.size() + " (" + artist + ")");

            try {
                List<SongInfoDTO> list = crawling(searchByArtist(artist));
                if (list == null) return;

                for (SongInfoDTO song : list) {
                    if (alreadyExits_songs.contains(song.getId())) continue;

//                    System.out.println(song);
                    newSongs.add(song);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

        // songInfos.addAll( Map.value.asList())

        return newSongs;
    }

    static public void writeJsonPerMonthForElasticSearchBulkInsert(String saveDirPath, List<SongInfoDTO> songInfos, int year, int mon) throws IOException {
        File dir = new File(saveDirPath);
        if (!dir.exists()) dir.mkdirs();

        BufferedWriter output = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(dir + "\\" + String.format("song_monthNew-%d-%02d-for-elasticsearch_bulk_insert.json", year, mon))
//                            new FileOutputStream(dir + "\\" + String.format("song_monthNew-%d-%02d.json", year, mon))
                ,"utf-8")
        );

        for (SongInfoDTO song: songInfos) {
            output.write(

                    objectMapper.writeValueAsString(Map.of(
                            "index", Map.of(
                                    "_index", "tj_song_list_idx",
                                    "_id", song.getId()
                            )
                    )) +"\n"
            );

            output.write(objectMapper.writeValueAsString(song) +"\n");
        }

        output.flush();
        output.close();
    }

    static public void writeJsonPerMonth(String saveDirPath, List<SongInfoDTO> songInfos, int year, int mon) throws IOException {
        File dir = new File(saveDirPath);
        if (!dir.exists()) dir.mkdirs();

        BufferedWriter output = new BufferedWriter(new OutputStreamWriter(
                            new FileOutputStream(dir + "\\" + String.format("song_monthNew-%d-%02d.json", year, mon))
                ,"utf-8")
        );

        output.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(songInfos));

        output.flush();
        output.close();
    }

    static public void  writeJsonForElasticSearchBulkInsert(String saveDirPath, List<SongInfoDTO> songInfos) throws IOException {
        File dir = new File(saveDirPath);
        if (!dir.exists()) dir.mkdirs();

        BufferedWriter output = new BufferedWriter(new OutputStreamWriter(
                            new FileOutputStream(dir + "\\song_monthNew-for-elasticsearch_bulk_insert.json")
                ,"utf-8")
        );

        for (SongInfoDTO song: songInfos) {
            output.write(

                    objectMapper.writeValueAsString(Map.of(
                            "index", Map.of(
                                    "_index", "tj_song_list_idx",
                                    "_id", song.getId()
                            )
                    )) +"\n"
            );

            output.write(objectMapper.writeValueAsString(song) +"\n");
        }

        output.flush();
        output.close();
    }

    static public void  writeJson(String saveDirPath, List<SongInfoDTO> songInfos) throws IOException {
        File dir = new File(saveDirPath);
        if (!dir.exists()) dir.mkdirs();

        BufferedWriter output = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(dir + "\\song_monthNew.json")
                ,"utf-8")
        );

        output.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(songInfos));

        output.flush();
        output.close();
    }
}
