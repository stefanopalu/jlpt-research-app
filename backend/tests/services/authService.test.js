process.env.JWT_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const authService = require('../../services/authService');

jest.mock('jsonwebtoken');
jest.mock('../../models/user');

const User = require('../../models/user');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should login successfully with correct credentials', async () => {
      // Set the env var before calling
      process.env.JWT_SECRET = 'test-secret';
      
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'password123',
      };
      
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(jwt.sign).toHaveBeenCalledWith(
        { username: 'testuser', id: 'user123' },
        'test-secret',
      );
      expect(result).toEqual({
        value: 'mock-jwt-token',
        user: {
          username: 'testuser',
          id: 'user123',
        },
      });
    });

    test('should throw error with wrong password', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'correct-password',
      };
      
      User.findOne.mockResolvedValue(mockUser);

      await expect(
        authService.login({ username: 'testuser', password: 'wrong-password' }),
      ).rejects.toThrow(GraphQLError);

      await expect(
        authService.login({ username: 'testuser', password: 'wrong-password' }),
      ).rejects.toThrow('wrong credentials');
    });

    test('should throw error with non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        authService.login({ username: 'nonexistent', password: 'password' }),
      ).rejects.toThrow(GraphQLError);
    });

    test('should throw error when JWT_SECRET is missing', async () => {
      delete process.env.JWT_SECRET;
      
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: 'password123',
      };
      
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockImplementation(() => {
        throw new Error('secretOrPrivateKey is required');
      });

      await expect(
        authService.login({ username: 'testuser', password: 'password123' }),
      ).rejects.toThrow();
    });
  });
});