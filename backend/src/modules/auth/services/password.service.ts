import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { OtpService } from './otp.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { OtpType } from '../../../../prisma/generated/client';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { generateTokens } from '../utils/token.util';
import * as bcrypt from 'bcrypt';
import {
    NotFoundException,
    OtpInvalidException,
    UnauthorizedException,
} from '../../../common/exceptions/business.exception';

@Injectable()
export class PasswordService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly otpService: OtpService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) { }

    async forgotPassword(dto: ForgotPasswordDto) {
        return this.otpService.sendOtp({
            email: dto.email,
            type: OtpType.PASSWORD_RESET,
        });
    }

    async resetPassword(dto: ResetPasswordDto) {
        try {
            const decoded = this.jwtService.verify(dto.resetToken);
            if (decoded.purpose !== 'reset-password') {
                throw new UnauthorizedException('Invalid token purpose');
            }

            const user = await this.prisma.user.findUnique({
                where: { id: decoded.sub },
            });
            if (!user) {
                throw new NotFoundException('User');
            }

            const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
            const updatedUser = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    status: 'ACTIVE',
                    lastLoginAt: new Date(),
                },
            });

            // Generate tokens for seamless auto-login
            const payload = {
                sub: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
            };
            const { accessToken, refreshToken } = generateTokens(
                this.jwtService,
                this.configService,
                payload,
            );

            // Store refresh token in Redis (30 days)
            const refreshExpiresInStr = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') as string;
            const ttlSeconds = refreshExpiresInStr && refreshExpiresInStr.includes('d')
                ? parseInt(refreshExpiresInStr) * 24 * 60 * 60
                : 30 * 24 * 60 * 60;
            await this.redisService.set(`refresh_token:${updatedUser.id}`, refreshToken, ttlSeconds);

            return ResponseHelper.success(
                {
                    accessToken,
                    refreshToken,
                    user: {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        role: updatedUser.role,
                    },
                },
                'Password reset successful. You are now logged in.',
            );
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new UnauthorizedException('Invalid or expired reset token');
        }
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) {
            throw new NotFoundException('User');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.oldPassword,
            user.password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid old password');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return ResponseHelper.success(null, 'Password changed successfully');
    }
}