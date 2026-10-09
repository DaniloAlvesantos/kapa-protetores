import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react-native';
import { Text, Pressable, View } from 'react-native';
import { AuthProvider } from '../../src/contexts/authProvider';
import { useAuth } from '../../src/hooks/useAuth';
import { router } from 'expo-router';
import { apiRequest } from '../../src/services/api';
import { genericStorage } from '../../src/storage/genericStorage';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('../../src/services/api', () => {
  class MockApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
      this.name = 'ApiError';
    }
  }

  return {
    apiRequest: jest.fn(),
    ApiError: MockApiError,
    setAccessToken: jest.fn(),
  };
});

jest.mock('../../src/services/kapaService', () => ({
  kapaService: {
    defaults: { headers: { common: {} } },
    post: jest.fn(),
  },
  setOnUnauthorizedCallback: jest.fn(),
}));

function ConsumerComponent({ email }: { email: string }) {
  const { hasAdopterProfile, signIn } = useAuth();

  return (
    <View>
      <Text testID="has-profile-value">{String(hasAdopterProfile)}</Text>
      <Pressable
        testID="sign-in-btn"
        onPress={() => {
          void signIn(email, 'SenhaForte123!');
        }}
      >
        <Text>Entrar</Text>
      </Pressable>
    </View>
  );
}

describe('AuthProvider - First Login AdopterProfile enforcement', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await genericStorage.remove('@kapa:auth-token');
    await genericStorage.remove('@kapa:user-data');
    await genericStorage.remove('@kapa:has-adopter-profile');
  });

  it('redirects adopter to /(protected)/adopter-profile on first login when profile does not exist (404)', async () => {
    const { ApiError: MockApiError } = require('../../src/services/api');
    (apiRequest as jest.Mock).mockRejectedValueOnce(
      new MockApiError('Not found', 404),
    );

    const mockKapaService = require('../../src/services/kapaService').kapaService;
    mockKapaService.post.mockResolvedValueOnce({
      data: {
        data: {
          token: 'valid.mock.token',
          user: {
            id: 'user-1',
            username: 'NovoAdotante',
            email: 'novo@teste.com',
            role: 'adopter',
            rules: ['user:read:own'],
            createdAt: new Date().toISOString(),
          },
        },
      },
    });

    await render(
      <AuthProvider>
        <ConsumerComponent email="novo@teste.com" />
      </AuthProvider>,
    );

    const signInBtn = screen.getByTestId('sign-in-btn');
    await act(async () => {
      await fireEvent.press(signInBtn);
    });

    expect(router.replace).toHaveBeenCalledWith(
      '/(protected)/adopter-profile',
    );
    expect(screen.getByTestId('has-profile-value').props.children).toBe('false');
  });

  it('redirects adopter to /(protected)/(tabs) when profile already exists (200)', async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce({
      id: 'profile-1',
      userId: 'user-1',
      preferredSpecies: 'dog',
    });

    const mockKapaService = require('../../src/services/kapaService').kapaService;
    mockKapaService.post.mockResolvedValueOnce({
      data: {
        data: {
          token: 'valid.mock.token',
          user: {
            id: 'user-1',
            username: 'AdotanteExistente',
            email: 'existente@teste.com',
            role: 'adopter',
            rules: ['user:read:own'],
            createdAt: new Date().toISOString(),
          },
        },
      },
    });

    await render(
      <AuthProvider>
        <ConsumerComponent email="existente@teste.com" />
      </AuthProvider>,
    );

    const signInBtn = screen.getByTestId('sign-in-btn');
    await act(async () => {
      await fireEvent.press(signInBtn);
    });

    expect(router.replace).toHaveBeenCalledWith(
      '/(protected)/(tabs)',
    );
    expect(screen.getByTestId('has-profile-value').props.children).toBe('true');
  });
});
