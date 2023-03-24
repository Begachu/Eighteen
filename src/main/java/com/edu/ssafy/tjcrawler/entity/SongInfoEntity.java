package com.edu.ssafy.tjcrawler.entity;

import com.edu.ssafy.tjcrawler.util.BaseTimeEntity;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
//@Entity @Table(name = "MUSIC")
public class SongInfoEntity extends BaseTimeEntity {
//    @Id
    @EqualsAndHashCode.Include
//    @Column(name = "MUSIC_ID")
    int id;
    String title;
    String singer;
    String youtube_url;
}
