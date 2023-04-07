package com.eighteen.userservice.dto.response;

import com.eighteen.userservice.dto.MusicDto;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.*;

import java.util.List;
import java.util.Set;

@NoArgsConstructor
@Getter
@AllArgsConstructor
@Setter
@ApiModel(value = "ResponseRandomDto", description = "ResponseRandomDto")
public class ResponseRandomDto {

    @ApiModelProperty(value = "빠른선곡 목록", required = true)
    private Set<MusicDto> randoms;

}
