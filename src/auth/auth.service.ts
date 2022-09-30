import {Injectable, UnauthorizedException} from '@nestjs/common';
import axios from "axios";
import * as qs from 'qs';

@Injectable()
export class AuthService {
    async kakaoLogin(param: { code: any; domain: any }) {
        const {code, domain} = param;
        const kakaoKey = 'e7b1329f8def7deb5b36c01b91c96646';
        const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
        const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';

        const body = {
            grant_type: 'authorization_code',
            client_id: kakaoKey,
            redirect_uri: `${domain}/kakao-callback`,
            code
        }
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        }
        try{
            const response = await axios({
                method: 'POST',
                url: kakaoTokenUrl,
                timeout: 30000,
                headers,
                data: qs.stringify(body)
            });
            console.log(response);
            const headerUserInfo = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                Authorization: 'Bearer '+ response.data.access_token,
            }
            const responseUserInfo = await axios({
                method: 'GET',
                url: kakaoUserInfoUrl,
                timeout: 30000,
                headers: headerUserInfo,
            })
            console.log(responseUserInfo);
            if(responseUserInfo.status === 200){
                return responseUserInfo.data;
            }else{
                throw new UnauthorizedException('로그인 실패');
            }
        }catch(error){
            console.log(error)
        }
    }
}
