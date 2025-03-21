package com.realestate.app.mypage;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MyPageController {

    @GetMapping("/mypage/mypage.html")
    public String myPage(Model model) {
        // 필요한 경우 모델에 데이터 추가
        return "mypage/mypage"; // mypage.html 파일의 경로
    }
}
