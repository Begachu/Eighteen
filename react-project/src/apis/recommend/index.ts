import { instance } from "..";
import { RecommendType } from "./type";

/**
 * [GET]노래 추천 목록 조회
 * @param recommend 추천방식(myEighteen, weather, emotion, situation)
 * @param id 추천선택 id
 */
const recommendSong = (recommend: RecommendType, token: string, id?: string) => {
  instance.defaults.headers["Authorization"] = token;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = {};
  if (id) {
    params[`${recommend}Id`] = id;
  }
  return instance.get(`/recommend/${recommend}`, { params });
};

/**
 * [GET]연령·성별 애창곡 랭킹 정보 조회
 * @param ageId 연령 ID
 * @param genderId 성별 ID
 */
const getEighteenRanking = (age: number, gender: string, token: string) => {
  instance.defaults.headers["Authorization"] = token;
  return instance.get(`/ranking`, { params: { age, gender } });
};

export { recommendSong, getEighteenRanking };
