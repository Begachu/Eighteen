package com.edu.ssafy.search.service;

import com.edu.ssafy.search.dto.SongInfoDTO;
import com.edu.ssafy.search.dto.SongWithPreferableDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class UserIdxService {
    @Value("${elasticsearch.username}")
    private String username;

    @Value("${elasticsearch.password}")
    private String password;

    @Value("${elasticsearch.max_data}")
    private long max_data_size;

    private final Gson gson;

    @Value("${server.port}")
    String server_port;

    ObjectMapper objectMapper = new ObjectMapper();

    final private SearchService searchService;

    private WebClient webClient = WebClient.builder()
            .baseUrl("http://j8b304.p.ssafy.io:9200")
            .build();


    public UserIdxService(SearchService searchService) {
        this.searchService = searchService;
        this.gson = new Gson();
    }

    public void regist(String user_id) {
        String responseBody;


        responseBody = webClient.method(HttpMethod.PUT)         // POST method
                .uri(String.format("/favorite_song_list@%s", user_id))    // baseUrl 이후 uri
                .headers(headers -> headers.setBasicAuth(username, password)) // basic auth
                .acceptCharset(Charset.forName("UTF-8"))
                .contentType(MediaType.APPLICATION_JSON) // json body
                .bodyValue(
                        "{\n" +
                                "  \"settings\": {\n" +
                                "    \"index\": {\n" +
                                "      \"analysis\": {\n" +
                                "        \"filter\": {\n" +
                                "          \"suggest_filter\": {\n" +
                                "            \"type\": \"edge_ngram\",\n" +
                                "            \"min_gram\": 1,\n" +
                                "            \"max_gram\": 50\n" +
                                "          }\n" +
                                "        },\n" +
                                "        \"tokenizer\": {\n" +
                                "          \"jaso_search_tokenizer\": {\n" +
                                "            \"type\": \"jaso_tokenizer\",\n" +
                                "            \"mistype\": true,\n" +
                                "            \"chosung\": false\n" +
                                "          },\n" +
                                "          \"jaso_index_tokenizer\": {\n" +
                                "            \"type\": \"jaso_tokenizer\",\n" +
                                "            \"mistype\": true,\n" +
                                "            \"chosung\": true\n" +
                                "          }\n" +
                                "        },\n" +
                                "        \"analyzer\": {\n" +
                                "          \"suggest_search_analyzer\": {\n" +
                                "            \"type\": \"custom\",\n" +
                                "            \"tokenizer\": \"jaso_search_tokenizer\"\n" +
                                "          },\n" +
                                "          \"suggest_index_analyzer\": {\n" +
                                "            \"type\": \"custom\",\n" +
                                "            \"tokenizer\": \"jaso_index_tokenizer\",\n" +
                                "            \"filter\": [\n" +
                                "              \"suggest_filter\"\n" +
                                "            ]\n" +
                                "          }\n" +
                                "        }\n" +
                                "      }\n" +
                                "    }\n" +
                                "  }\n" +
                                "}"
                )     // set body value
                .retrieve()                 // client message 전송
                .bodyToMono(String.class)  // body type : EmpInfo
                .block();                   // await


        responseBody = webClient.method(HttpMethod.PUT)         // POST method
                .uri(String.format("/favorite_song_list@%s/_mapping", user_id))    // baseUrl 이후 uri
                .headers(headers -> headers.setBasicAuth(username, password)) // basic auth
                .acceptCharset(Charset.forName("UTF-8"))
                .contentType(MediaType.APPLICATION_JSON) // json body
                .bodyValue(
                        "{\n" +
                                "  \"properties\": {\n" +
                                "    \"title\": {\n" +
                                "      \"type\": \"text\",\n" +
                                "      \"store\": true,\n" +
                                "      \"analyzer\": \"suggest_index_analyzer\",\n" +
                                "      \"search_analyzer\": \"suggest_search_analyzer\"\n" +
                                "    },\n" +
                                "    \n" +
                                "    \"singer\": {\n" +
                                "      \"type\": \"text\",\n" +
                                "      \"store\": true,\n" +
                                "      \"analyzer\": \"suggest_index_analyzer\",\n" +
                                "      \"search_analyzer\": \"suggest_search_analyzer\"\n" +
                                "    }\n" +
                                "  }\n" +
                                "}"
                )     // set body value
                .retrieve()                 // client message 전송
                .bodyToMono(String.class)  // body type : EmpInfo
                .block();                   // await
    }

    public void unregist(String user_id) {
        String responseBody;

        responseBody = webClient.method(HttpMethod.DELETE)         // POST method
                .uri(String.format("/favorite_song_list@%s", user_id))    // baseUrl 이후 uri
                .headers(headers -> headers.setBasicAuth(username, password)) // basic auth
                .acceptCharset(Charset.forName("UTF-8"))
                .retrieve()                 // client message 전송
                .bodyToMono(String.class)  // body type : EmpInfo
                .block();                   // await
    }

    public void addData(String user_id, List<SongInfoDTO> songs) throws IOException {
        StringBuilder sb = new StringBuilder();

        for (SongInfoDTO song : songs) {
            sb.append("{\"index\":{\"_id\":\"" + song.getId() + "\",\"_index\":\""+ "favorite_song_list@" + user_id  + "\"}}\n" +
                    "{\"id\":\"" + song.getId() + "\",\"title\":\"" + song.getTitle() + "\",\"singer\":\"" + song.getSinger() + "\",\"youtube_url\":\"" + song.getYoutube_url() + "\"}\n");
        }


//        webClient.method(HttpMethod.POST)         // POST method
//                .uri("/_bulk")    // baseUrl 이후 uri
//                .headers(headers -> headers.setBasicAuth("elastic", "b304b304")) // basic auth
//                .acceptCharset(Charset.forName("UTF-8"))
//                .contentType(MediaType.APPLICATION_NDJSON) // json body
//                .bodyValue(
//                        sb.toString().getBytes(StandardCharsets.UTF_8)
//                )     // set body value
//                .retrieve()                 // client message 전송
//                .bodyToMono(String.class)  // body type : EmpInfo
//                .block();                   // await

        URL url = new URL("http://j8b304.p.ssafy.io:9200/_bulk?pretty");
        HttpURLConnection http = (HttpURLConnection)url.openConnection();
        http.setRequestMethod("POST");
        http.setDoOutput(true);
        http.setRequestProperty("Content-Type", "application/x-ndjson");
        http.setRequestProperty("Authorization", "Basic " + new String(Base64.getEncoder().encode((username + ":" + password).getBytes())));

        byte[] out = sb.toString().getBytes(StandardCharsets.UTF_8);

        OutputStream stream = http.getOutputStream();
        stream.write(out);

        System.out.println(http.getResponseCode() + " " + http.getResponseMessage());
        if (http.getResponseCode()/100 != 2) System.out.println(new String(http.getErrorStream().readAllBytes()));
        http.disconnect();
    }

    public void deleteData(String user_id,List<SongInfoDTO> songs) throws IOException {
        StringBuilder sb = new StringBuilder();

        for (SongInfoDTO song : songs) {
            sb.append(String.format("{ \"delete\" : { \"_index\" : \"favorite_song_list@%s\", \"_id\" : \"%s\" } }\n", user_id, song.getId()));
        }


        sb.append("\n");

        URL url = new URL("http://j8b304.p.ssafy.io:9200/_bulk?pretty");
        HttpURLConnection http = (HttpURLConnection)url.openConnection();
        http.setRequestMethod("POST");
        http.setDoOutput(true);
        http.setRequestProperty("Content-Type", "application/x-ndjson");
        http.setRequestProperty("Authorization", "Basic " + new String(Base64.getEncoder().encode((username + ":" + password).getBytes())));

        byte[] out = sb.toString().getBytes(StandardCharsets.UTF_8);

        OutputStream stream = http.getOutputStream();
        stream.write(out);

        System.out.println(http.getResponseCode() + " " + http.getResponseMessage());
        if (http.getResponseCode()/100 != 2) System.out.println(new String(http.getErrorStream().readAllBytes()));
        http.disconnect();
    }

    public Set<Integer> getUserFavoriteSongWithId(String user_id) {
//        System.out.println("/favorite_song_list@" + user_id + "/_search?filter_path=hits.hits.*,aggregations.*");


        String responseBody = webClient.method(HttpMethod.POST)         // POST method
                .uri("/favorite_song_list@" + user_id + "/_search?filter_path=hits.hits.*,aggregations.*")    // baseUrl 이후 uri
                .headers(headers -> headers.setBasicAuth(username, password)) // basic auth
                .acceptCharset(Charset.forName("UTF-8"))
                .contentType(MediaType.APPLICATION_JSON) // json body
                .bodyValue(
                        "{\n" + "  \"size\": " + max_data_size + "\n" + "}"
                )     // set body value
                .retrieve()                 // client message 전송
                .bodyToMono(String.class)  // body type : EmpInfo
                .block();                   // await

//        System.out.println("response body : " + responseBody);
        Map<String, Map<String, List<Map<String, Map<String, Object>>>>> map = gson.fromJson(responseBody, Map.class);
        Set<Integer> list = new HashSet<>();

        if (map.isEmpty() || !map.get("hits").containsKey("hits")) return list;

        for (int i = 0;i < map.get("hits").get("hits").size();i++) {
            int id = Integer.parseInt((String) map.get("hits").get("hits").get(i).get("_source").get("id"));
            list.add(id);
        }

//        System.out.println(list);

        return list;
    }



    public Map<String, Object> searchBytitleAndPagination(String user_id, String title, long pagination_idx, long pagination_size) {
        List<SongInfoDTO> songs = searchService.searchBytitle(title);


        Set<Integer> user_favorite_songs = getUserFavoriteSongWithId(user_id);

//        System.out.println("size : " + songs.size());
//        System.out.println("start : " + pagination_idx*pagination_size + ", " + (pagination_idx+1)*pagination_size);

        List<SongWithPreferableDTO> list = new LinkedList<>();
        for (int i = (int) (pagination_idx*pagination_size); i < Math.min((pagination_idx+1)*pagination_size, songs.size()); i++) {
            SongWithPreferableDTO songWithPreferableDTO = objectMapper.convertValue(songs.get(i), SongWithPreferableDTO.class);
            songWithPreferableDTO.setPreferable(user_favorite_songs.contains(songWithPreferableDTO.getId()));
            list.add(songWithPreferableDTO);
        }

        return Map.of(
                "total_page", songs.size()/pagination_size + (songs.size()%pagination_size > 0?1:0),
                "music_list", list
        );
    }

    public Map<String, Object> searchBysingerAndPagination(String user_id, String singer, long pagination_idx, long pagination_size) {
        List<SongInfoDTO> songs = searchService.searchBysinger(singer);


        Set<Integer> user_favorite_songs = getUserFavoriteSongWithId(user_id);

//        System.out.println("size : " + songs.size());
//        System.out.println("start : " + pagination_idx*pagination_size + ", " + (pagination_idx+1)*pagination_size);

        List<SongWithPreferableDTO> list = new LinkedList<>();
        for (int i = (int) (pagination_idx*pagination_size); i < Math.min((pagination_idx+1)*pagination_size, songs.size()); i++) {
            SongWithPreferableDTO songWithPreferableDTO = objectMapper.convertValue(songs.get(i), SongWithPreferableDTO.class);
            songWithPreferableDTO.setPreferable(user_favorite_songs.contains(songWithPreferableDTO.getId()));
            list.add(songWithPreferableDTO);
        }

        return Map.of(
                "total_page", songs.size()/pagination_size + (songs.size()%pagination_size > 0?1:0),
                "music_list", list
        );
    }


    public Map<String, Object> searchBytitleAndPaginationWithPreferable(String user_id, String title, long pagination_idx, long pagination_size) {
        List<SongInfoDTO> songs = searchService.searchBytitleOnUserData(user_id, title);
        if (songs == null || songs.isEmpty()) return Map.of(
                "total_page", 0,
                "music_list", new LinkedList<>()
        );

        Set<Integer> user_favorite_songs = getUserFavoriteSongWithId(user_id);

//        System.out.println("size : " + songs.size());
//        System.out.println("start : " + pagination_idx*pagination_size + ", " + (pagination_idx+1)*pagination_size);

        List<SongWithPreferableDTO> list = new LinkedList<>();
        for (int i = (int) (pagination_idx*pagination_size); i < Math.min((pagination_idx+1)*pagination_size, songs.size()); i++) {
            SongWithPreferableDTO songWithPreferableDTO = objectMapper.convertValue(songs.get(i), SongWithPreferableDTO.class);
            songWithPreferableDTO.setPreferable(user_favorite_songs.contains(songWithPreferableDTO.getId()));
            list.add(songWithPreferableDTO);
        }

        return Map.of(
                "total_page", songs.size()/pagination_size + (songs.size()%pagination_size > 0?1:0),
                "music_list", list
        );
    }

    public Map<String, Object> searchBysingerAndPaginationWithPreferable(String user_id, String singer, long pagination_idx, long pagination_size) {
        List<SongInfoDTO> songs = searchService.searchBysingerOnUserData(user_id, singer);
        if (songs == null || songs.isEmpty()) return Map.of(
                "total_page", 0,
                "music_list", new LinkedList<>()
        );

        Set<Integer> user_favorite_songs = getUserFavoriteSongWithId(user_id);

//        System.out.println("size : " + songs.size());
//        System.out.println("start : " + pagination_idx*pagination_size + ", " + (pagination_idx+1)*pagination_size);

        List<SongWithPreferableDTO> list = new LinkedList<>();
        for (int i = (int) (pagination_idx*pagination_size); i < Math.min((pagination_idx+1)*pagination_size, songs.size()); i++) {
            SongWithPreferableDTO songWithPreferableDTO = objectMapper.convertValue(songs.get(i), SongWithPreferableDTO.class);
            songWithPreferableDTO.setPreferable(user_favorite_songs.contains(songWithPreferableDTO.getId()));
            list.add(songWithPreferableDTO);
        }

        return Map.of(
                "total_page", songs.size()/pagination_size + (songs.size()%pagination_size > 0?1:0),
                "music_list", list
        );
    }
}
