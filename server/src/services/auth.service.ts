import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { SALT_ROUNDS } from '../utils/constants';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw { status: 409, message: 'Email already registered' };
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async refresh(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw { status: 401, message: 'Refresh token required' };
    }

    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw { status: 401, message: 'Invalid refresh token' };
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== oldRefreshToken) {
      throw { status: 401, message: 'Invalid refresh token' };
    }

    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }
    return user.toJSON();
  }
}
