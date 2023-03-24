package com.edu.ssafy.tjcrawler.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SongInfoDTO {
    String id;
    String title;
    String singer;
    String youtube_url;
}
