import React, { useState } from "react";
import styled from "styled-components";
import DatePicker, { registerLocale } from "react-datepicker";
import { Select } from "../../common/select";
import { userState } from "../../../recoil/atom/userState";
import { VerifyInput } from "../../common/input/Verify";
import { nicknameVerify } from "../../../utils/validation";
import ko from "date-fns/locale/ko";
import moment from "moment";
import RegusterProfileDataPicker from "./RegusterProfileDataPicker";
import { TextButton } from "../../common/button";
import { modifyProfile } from "../../../apis/profile";
import { useRecoilState } from "recoil";
import { authState } from "../../../recoil/atom/authState";
import axios from "axios";
import { searchRegist } from "../../../apis/search";

registerLocale("ko", ko);

interface Props {
  nextPage(): void;
}

const RegisterProfile = ({ nextPage }: Props): JSX.Element => {
  const [auth, setAuth] = useRecoilState(authState);
  const [user, setUser] = useRecoilState(userState);
  const [datePicker, setDatePicker] = useState<number>(0);
  const [pass, setPass] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  if (!user) return <></>;
  const { birth, gender, nickname } = user;

  const setGender = (gender: "M" | "F") => {
    setUser({ ...user, gender });
  };

  const setNickname = (nickname: string) => {
    setUser({ ...user, nickname });
  };

  const setBirth = (date: Date | null) => {
    if (date) setUser({ ...user, birth: moment(date).format("YYYY-MM-DD") });
    setDatePicker(datePicker - 1);
  };

  const onShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const onSubmit = async () => {
    if (!pass) onShake();
    else {
      await searchRegist(auth.token);

      // TODO : user 값 토대로 프로필 값 수정 요청 보내기
      const formData = new FormData();
      const newProfile = JSON.stringify({
        nickname,
        gender,
        birth,
      });
      formData.append("profileInfo", new Blob([newProfile], { type: "application/json" }));

      try {
        const res = await modifyProfile(formData, auth.token);

        if (res.data == "ok") {
          nextPage();
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 401) {
            setAuth({ ...auth, token: "" });
          }
        }
      }
    }
  };

  return (
    <StyledDiv>
      <h1>
        <span>어서오세요!</span>
        <span>에이틴은 처음이죠?</span>
      </h1>
      <h2>
        <span>당신을 위한 노래 추천을 할 수 있도록</span>
        <span>당신에 대해 알려주세요</span>
      </h2>

      <div className="flex">
        <div className="data">
          <label>생년월일</label>
          <DatePicker
            open={Boolean(datePicker)}
            onInputClick={() => setDatePicker(3)}
            onClickOutside={() => setDatePicker(0)}
            selected={moment(birth, "YYYY-MM-DD").toDate()}
            dateFormat={"yyyy-MM-dd"}
            // showYearPicker={yearPicker}
            showMonthYearPicker={datePicker == 2}
            showYearPicker={datePicker == 3}
            dateFormatCalendar={"yyyy년 MM월"}
            customInput={<RegusterProfileDataPicker />}
            locale="ko"
            onChange={setBirth}
          />
        </div>

        <div className="data">
          <label>성별</label>
          <Select value={gender} options={genderSelect} setValue={setGender} />
        </div>
      </div>
      <div className="data">
        <label>닉네임</label>
        <VerifyInput
          value={nickname}
          setValue={setNickname}
          setPass={setPass}
          notice={shake}
          verify={nicknameVerify(auth.token)}
        />
      </div>

      <div className="next-button">
        <TextButton text={"다음단계로 →"} color={"blue"} onClick={onSubmit} />
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  & .flex {
    display: flex;
    margin-top: 32px;
  }
  & .data {
    display: flex;
    flex-direction: column;
    margin: 16px 0;
    margin-right: 16px;
    & > label {
      font-size: 12px;
      padding: 4px;
    }
  }

  & > .next-button {
    width: 100%;
    margin-top: 60px;
    display: flex;
    justify-content: center;
  }
  // Datepicker CSS
  & .react-datepicker-wrapper {
    width: auto;
  }

  & .react-datepicker {
    border: 0;
    padding: 8px;
    background-color: var(--black-600);
    font: inherit;
    font-size: 14px;
    & * {
      background-color: var(--black-600);
      color: var(--black-50);
    }
    & .react-datepicker__navigation {
      top: 16px;
    }
    & .react-datepicker__current-month,
    & .react-datepicker-month-header,
    & .react-datepicker-year-header {
      padding: 8px;
      color: var(--blue-500);
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0;
    }
    & .react-datepicker__year-wrapper {
      justify-content: center;
    }
    & .react-datepicker__year-text,
    & .react-datepicker__month-text {
      height: 32px;
      line-height: 32px;
      font-size: 16px;
    }
    & .react-datepicker__triangle {
      &::after,
      &::before {
        border: 0 !important;
      }
    }
    & .react-datepicker__day {
      border-radius: 50%;
    }
    & .react-datepicker__day--selected,
    & .react-datepicker__year-text--selected,
    & .react-datepicker__month--selected,
    & .react-datepicker__month-text--selected {
      font-weight: 900;
      background-color: var(--blue-500) !important;
    }
  }
`;

const genderSelect = [
  { text: "남성", value: "M" },
  { text: "여성", value: "F" },
];

export default RegisterProfile;
