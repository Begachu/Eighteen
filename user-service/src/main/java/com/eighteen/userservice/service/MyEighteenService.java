package com.eighteen.userservice.service;

import com.eighteen.userservice.dto.MusicDto;
import com.eighteen.userservice.dto.request.RequestEighteenDto;
import com.eighteen.userservice.dto.response.ResponseGetEighteenDto;
import com.eighteen.userservice.dto.response.ResponseRandomDto;
import com.eighteen.userservice.entity.Music;
import com.eighteen.userservice.entity.MyEighteen;
import com.eighteen.userservice.entity.User;
import com.eighteen.userservice.repository.MusicRepository;
import com.eighteen.userservice.repository.MyEighteenRepository;
import com.eighteen.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MyEighteenService {

    private final MyEighteenRepository myEighteenRepository;

    private final UserRepository userRepository;
    private final MusicRepository musicRepository;

    public ResponseGetEighteenDto getEighteen(String userId, Integer page, Integer size) {

        User user = userRepository.findByUserId(userId);
        List<MyEighteen> myEighteens = myEighteenRepository.findByUser(user);
        if (myEighteens.size() < size) {
            size = myEighteens.size();
        }
        List<MusicDto> musicDtos = new ArrayList<>();
        for (MyEighteen myEighteen : myEighteens) {
            MusicDto musicDto = new ModelMapper().map(myEighteen.getMusic(), MusicDto.class);
            musicDto.setIsEighteen(Boolean.TRUE);
            musicDtos.add(musicDto);
        }
        Pageable pageable = PageRequest.of(page, size);
        int start = (int)pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), musicDtos.size());
        Page<MusicDto> musicDtoPage = new PageImpl<>(musicDtos.subList(start, end), pageable, musicDtos.size());

        ResponseGetEighteenDto responseGetEighteenDto = new ResponseGetEighteenDto(musicDtoPage);

        return responseGetEighteenDto;
    }

    public ResponseRandomDto getRandom(String userId) {

        User user = userRepository.findByUserId(userId);

        List<MyEighteen> myEighteens = myEighteenRepository.findByUser(user);
        Random random = new Random();
        List<MusicDto> randoms = new ArrayList<>();

        if (myEighteens.size() > 5) {
            for (int i = 0; i < 5; i++) {
                int randomIndex = random.nextInt(myEighteens.size());
                MyEighteen randomElement = myEighteens.get(randomIndex);
                MusicDto randomMusic = new ModelMapper().map(randomElement, MusicDto.class);
                randomMusic.setIsEighteen(Boolean.TRUE);
                randoms.add(randomMusic);
            }
        }
        else {
            for (MyEighteen myEighteen : myEighteens) {
                MusicDto randomMusic = new ModelMapper().map(myEighteen, MusicDto.class);
                randomMusic.setIsEighteen(Boolean.TRUE);
                randoms.add(randomMusic);
            }
        }

        ResponseRandomDto responseRandomDto = new ResponseRandomDto(randoms);
        return responseRandomDto;
    }

    public String addEighteen(String userId, RequestEighteenDto requestEighteenDto) {

        User user = userRepository.findByUserId(userId);
        Music music = musicRepository.findByMusicId(requestEighteenDto.getMusicId());
        MyEighteen myEighteen = MyEighteen.builder()
                .user(user)
                .music(music)
                .build();
        myEighteenRepository.save(myEighteen);
        return music.getTitle();
    }

    public String deleteEighteen(String userId, Integer musicId) {

        User user = userRepository.findByUserId(userId);
        Music music = musicRepository.findByMusicId(musicId);
        MyEighteen myEighteen = myEighteenRepository.findByUserAndMusic(user, music);
        myEighteenRepository.delete(myEighteen);
        return music.getTitle();
    }

}