import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(email: string, password: string, name: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.repo.create({ email, password: hashed, name });
    return await this.repo.save(user);
  }
  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email } });
  }
  async findById(id: number): Promise<User | null> {
    return await this.repo.findOne({ where: { id } });
  }
  async validatePassword(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }

  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.repo.update(userId, { hashedRefreshToken: hashedRefresh });
  }

  // ✅ Remove refresh token (logout)
  async removeRefreshToken(userId: number): Promise<void> {
    await this.repo.update(userId, { hashedRefreshToken: null });
  }
  async validateRefreshToken(
    token: string,
    hashedToken: string,
  ): Promise<boolean> {
    return await bcrypt.compare(token, hashedToken);
  }
}
