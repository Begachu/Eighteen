package com.edu.ssafy.tjcrawler;

import com.edu.ssafy.tjcrawler.util.TJSongListCrawlerUtil;
import com.edu.ssafy.tjcrawler.dto.SongInfoDTO;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.*;

/**************************************************************************************************************************
 *                      노래목록을 파일을 저장하기 위한 main입니다.
 *                      첫번째, TjCrawlerApplication_db파일에 존재하는 주석을 모두 해제합니다.
 *                      두번째, build.gradle에 가서 JPA 관련 설정에 대한 주석을 해제합니다.
 *                      마지막으로 application.properties에 JPA 관련 설정(Datasource, JPA 등)을 설정합니다.
 ***************************************************************************************************************************/


@SpringBootApplication
public class TjCrawlerApplication implements CommandLineRunner {
    @Value("${tj_song_crawler.end_year}")
    Integer end_year;


    public static void main(String[] args) {
        SpringApplication.run(TjCrawlerApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        List<SongInfoDTO> _songInfos = new LinkedList<>();

        for (int year = end_year; year >= 2002;year--)
        {
            for (int mon = 12;mon >= 1;mon--) {

                List<SongInfoDTO> songInfos = TJSongListCrawlerUtil.crawling(TJSongListCrawlerUtil.searchByNewSong(year, mon));

                if (songInfos == null) continue;

                // 아래 'System.out.println' sleep 역할을 함(DDoS 탐지 및 요청 거부 당하는걸 막기위함).
//                System.out.println(String.format("%d월%d : ", year, mon) + songInfos);

                // 노래 목록을 한 곳에 저장하기
                _songInfos.addAll(songInfos);





                /********************************************************************
                 *                          파일 저장 1
                 ********************************************************************/

                //  Elasticsearch bulk insert문을 월별로 받기(개별 파일 저장)
//                TJSongListCrawlerUtil.writeJsonPerMonthForElasticSearchBulkInsert("C:\\OUTPUTS\\TEST", songInfos, year, mon);

                // TJ 노래목록을 월별로 받기(개별 파일 저장)
//                TJSongListCrawlerUtil.writeJsonPerMonth("C:\\OUTPUTS\\TEST", songInfos, year, mon);
            }

        }

        /********************************************************************
         *                          파일 저장 2
         ********************************************************************/
//        // json을 파일 한개로 저장하기
//        TJSongListCrawlerUtil.writeJson("C:\\OUTPUTS\\TEST", _songInfos);
//
//        // Elasticsearch bulk insert문을 파일 한개로 저장하기
//        TJSongListCrawlerUtil.writeJsonForElasticSearchBulkInsert("C:\\OUTPUTS\\TEST", _songInfos);

        System.out.println("Let's find hidden song list");
        List<SongInfoDTO> hiddenSongs = TJSongListCrawlerUtil.crawlingHiddenSongs(_songInfos);


        // 숨겨진 곡 정보를 json을 파일 한개로 저장하기
//        TJSongListCrawlerUtil.writeJson("C:\\OUTPUTS\\hidden", hiddenSongs);
        TJSongListCrawlerUtil.writeJson("./hidden", hiddenSongs);


        // 숨겨진 곡 정보를 포함해서 Elasticsearch bulk insert문을 파일 한개로 저장하기
        _songInfos.addAll(hiddenSongs);
        System.out.println("hiddenSongs : " + hiddenSongs);
        TJSongListCrawlerUtil.writeJsonForElasticSearchBulkInsert("all", _songInfos);
        TJSongListCrawlerUtil.writeJson("all", hiddenSongs);
    }
}
