import { useState, useEffect } from "react";
import dayjs from "dayjs";

export const useAuth = () => {
  const [loginState, setLoginState] = useState(() => {
    const storedState = localStorage.getItem("loginState");
    return storedState
      ? JSON.parse(storedState)
      : {
          isLogin: true,
          showLogin: false,
          lastLoginTime: "0000-00-00 00:00:00",
          lastLogoutTime: "0000-00-00 00:00:00",
          loggedInMemberName: "",
          loggedInMemberId: "",
          loggedInMemberLevel: "",
          token: null,
        };
  });

  useEffect(() => {
    localStorage.setItem("loginState", JSON.stringify(loginState));
  }, [loginState]);

  const login = (userData, token) => {
    setLoginState({
      isLogin: true,
      showLogin: false,
      lastLoginTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      loggedInMemberName: userData.mb_name,
      loggedInMemberId: userData.mb_id,
      loggedInMemberLevel: userData.mb_level,
      token: token,
    });
    localStorage.setItem("token", token); // 토큰을 로컬 스토리지에 저장
  };

  const logout = () => {
    setLoginState({
      isLogin: false,
      showLogin: false,
      lastLoginTime: loginState.lastLoginTime,
      lastLogoutTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      loggedInMemberName: "",
      loggedInMemberId: "",
      loggedInMemberLevel: "",
      token: null,
    });
  };

  const toggleLoginPopup = (show) => {
    setLoginState((prev) => ({ ...prev, showLogin: show }));
  };

  return { loginState, login, logout, toggleLoginPopup };
};
