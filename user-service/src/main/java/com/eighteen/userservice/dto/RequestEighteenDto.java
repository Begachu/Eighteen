package com.eighteen.userservice.dto;

import com.eighteen.userservice.entity.Music;
import com.eighteen.userservice.entity.MyEighteen;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@Setter
@ApiModel(value = "RequestEighteenDto", description = "RequestEighteenDto")
public class RequestEighteenDto {

    @ApiModelProperty(value = "유저 id", required = true)
    private String userId;

    @ApiModelProperty(value = "노래", required = true)
    private Music music;
}
