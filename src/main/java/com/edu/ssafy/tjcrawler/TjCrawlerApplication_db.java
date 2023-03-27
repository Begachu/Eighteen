package com.edu.ssafy.tjcrawler;

import com.edu.ssafy.tjcrawler.dto.SongInfoDTO;
import com.edu.ssafy.tjcrawler.util.TJSongListCrawlerUtil;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
//import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;

import java.util.List;

/**************************************************************************************************************************
 *                      노래목록을 DB에 저장하기 위한 main입니다.
 *                      첫번째, TjCrawlerApplication_db.java 파일에 존재하는 주석을 모두 해제합니다.
 *                      두번째, build.gradle에 가서 JPA 관련 설정에 대한 주석을 해제합니다.
 *                      세번째, SongInfoEntity.java, BaseTimeEntity.java 클래스 파일의 주석을 해제합니다.
 *                      마지막으로 application.properties에 JPA 관련 설정(Datasource, JPA 등)을 설정합니다.
 ***************************************************************************************************************************/


//@EnableJpaAuditing
//@SpringBootApplication
public class TjCrawlerApplication_db implements CommandLineRunner {
    @Value("${tj_song_crawler.end_year}")
    Integer end_year;

//    @PersistenceContext
//    EntityManager entityManager;

    public static void main(String[] args) {
        SpringApplication.run(TjCrawlerApplication_db.class, args);
    }

//    @Transactional
    @Override
    public void run(String... args) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.enable(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);

        for (int year = end_year; year >= 2002;year--)
        {
            for (int mon = 12;mon >= 1;mon--) {

                List<SongInfoDTO> songInfos = TJSongListCrawlerUtil.crawling(TJSongListCrawlerUtil.searchByNewSong(year, mon));

                if (songInfos == null) continue;

                // 아래는 sleep 역할을 함.
                System.out.println(String.format("%d월%d : ", year, mon) + songInfos);


                for (SongInfoDTO song : songInfos) {
//                    entityManager.persist(
//                            objectMapper.convertValue(song, SongInfoEntity.class)
//                    );
                }
            }
        }


//        entityManager.flush();
//        entityManager.clear();
    }
}
