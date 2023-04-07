package com.eighteen.authservice.oauth;

import com.eighteen.authservice.entity.User;
import com.eighteen.authservice.oauth.provider.GoogleUserInfo;
import com.eighteen.authservice.oauth.provider.KakaoUserInfo;
import com.eighteen.authservice.oauth.provider.NaverUserInfo;
import com.eighteen.authservice.oauth.provider.OAuth2UserInfo;
import com.eighteen.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class PrincipalOauth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    //구글로부터 받은 userRequest데이터에 대해 후처리되는함수
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        OAuth2UserInfo oAuth2UserInfo = null;
        if(userRequest.getClientRegistration().getRegistrationId().equals("google")) {
            System.out.println("google");
            oAuth2UserInfo = new GoogleUserInfo(oAuth2User.getAttributes());
        }else if(userRequest.getClientRegistration().getRegistrationId().equals("naver")) {
            System.out.println("naver");
            System.out.println((Map)oAuth2User.getAttributes().get("response"));
            oAuth2UserInfo = new NaverUserInfo((Map)oAuth2User.getAttributes().get("response"));
        }else if(userRequest.getClientRegistration().getRegistrationId().equals("kakao")) {
            System.out.println("kakao");
            oAuth2UserInfo = new KakaoUserInfo(oAuth2User.getAttributes());
        }

        String provider = oAuth2UserInfo.getProvider();
        String providerId = oAuth2UserInfo.getProviderId();
        String userId = provider+"_"+providerId;
        String email = oAuth2UserInfo.getEmail();
        User userEntity = userRepository.findByUserId(userId);
        if(userEntity==null) {
            userEntity = User.builder()
                    .userId(userId)
                    .email(email)
                    .build();
            userRepository.save(userEntity);
        }

        System.out.println(oAuth2User.getAttributes());
        return new PrincipalDetails(userEntity, oAuth2User.getAttributes());
    }

}
