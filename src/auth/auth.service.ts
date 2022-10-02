import {Injectable, UnauthorizedException} from '@nestjs/common';
import axios from "axios";
import * as qs from 'qs';
import {UserService} from "./user.service";
import {User} from "../domain/user.entity";
import {Payload} from "./security/payload.interface";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {
    }
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

    async login(kakao: any): Promise<{accessToken: string} | undefined> {
        //회원 가입 여부 체크
        let userFind: User = await this.userService.findByFields({
            where: {kakaoId: kakao.id}
        })
        if(!userFind){
            const user = new User();
            user.kakaoId = kakao.id;
            user.email = kakao.kakao_account.email;
            user.name = kakao.kakao_account.name;
            userFind = await this.userService.registerUser(user);
        }

        const payload: Payload = {
            id: userFind.id,
            name: userFind.name,
            authorities: userFind.authorities
        }

        return{
            accessToken: this.jwtService.sign(payload)
        };
    }
}
