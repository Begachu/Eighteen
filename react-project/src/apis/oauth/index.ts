import { instance } from "..";
import { OAuth } from "./type";

/**
 * [GET]access token 요청
 */
export const checkUser = () => {
  return instance.get(`/auth/reIssue`);
};

export const login = (type: OAuth) => {
  window.location.href = `/oauth2/authorization/${type}`;
};