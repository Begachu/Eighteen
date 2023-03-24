package com.edu.ssafy.tjcrawler.util;


import lombok.Getter;

import java.time.LocalDateTime;

@Getter
//@MappedSuperclass
//@EntityListeners(AuditingEntityListener.class)  // Auditing 기능 포함
public abstract class BaseTimeEntity {

//    @CreatedDate
//    @Column(updatable = false)
    private LocalDateTime createdDate;

//    @LastModifiedDate
    private LocalDateTime modifiedDate;
}

