package com.eighteen.userservice.dto;

import com.eighteen.userservice.entity.Music;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Objects;


@NoArgsConstructor
@Getter
@Setter
@ApiModel(value = "MusicDto", description = "MusicDto")
public class MusicDto {

    @ApiModelProperty(value = "노래 번호", required = true)
    private Integer musicId;

    @ApiModelProperty(value = "노래 제목", required = true)
    private String title;

    @ApiModelProperty(value = "가수", required = true)
    private String singer;

    @ApiModelProperty(value = "썸네일", required = true)
    private String thumbnailUrl;

    @ApiModelProperty(value = "애창곡 여부", required = true)
    private Boolean isEighteen;

    public MusicDto(Music music, Boolean isEighteen) {

        this.musicId = music.getMusicId();
        this.title = music.getTitle();
        this.singer = music.getSinger();
        this.thumbnailUrl = music.getThumbnailUrl();
        this.isEighteen = isEighteen;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        MusicDto musicDto = (MusicDto) o;
        return Objects.equals(musicId, musicDto.musicId) &&
                Objects.equals(title, musicDto.title) &&
                Objects.equals(singer, musicDto.singer) &&
                Objects.equals(thumbnailUrl, musicDto.thumbnailUrl) &&
                Objects.equals(isEighteen, musicDto.isEighteen);
    }

    @Override
    public int hashCode() {
        return Objects.hash(musicId, title, singer, thumbnailUrl, isEighteen);
    }
}
