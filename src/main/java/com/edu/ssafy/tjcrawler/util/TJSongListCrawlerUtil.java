package com.edu.ssafy.tjcrawler.util;

import com.edu.ssafy.tjcrawler.dto.SongInfoDTO;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.*;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class TJSongListCrawlerUtil {
    static private ObjectMapper objectMapper;

    static {
        objectMapper = new ObjectMapper();
        objectMapper.enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);
    }

    static public List<SongInfoDTO> crawling(int year, int mon) throws IOException {
        Document doc = Jsoup.connect(String.format("http://m.tjmedia.co.kr/tjsong/song_monthNew.asp?YY=%d&MM=%02d", year, mon)).get();

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
                            .youtube_url("https://www.youtube.com/user/ziller/search?query=" + el.select("td").get(0).text())
                            .build()
            );
        }

        return songInfos.isEmpty()? null : songInfos;
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
