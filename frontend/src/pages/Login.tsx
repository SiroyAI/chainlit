import { apiClient } from 'api';
import { useAuth } from 'api/auth';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AuthLogin } from '@chainlit/react-components';

import { Logo } from 'components/atoms/logo';

import { useQuery } from 'hooks/query';

export default function Login() {
  const query = useQuery();
  const { data: config, setAccessToken, user } = useAuth();
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const { t } = useTranslation();

  const handleHeaderAuth = async () => {
    try {
      const json = await apiClient.headerAuth();
      setAccessToken(json.access_token);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePasswordLogin = async (
    email: string,
    password: string,
    callbackUrl: string
  ) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const json = await apiClient.passwordAuth(formData);
      setAccessToken(json.access_token);
      navigate(callbackUrl);
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    setError(query.get('error') || '');
  }, [query]);

  useEffect(() => {
    if (!config) {
      return;
    }
    if (!config.requireLogin) {
      navigate('/');
    }
    if (config.headerAuth) {
      handleHeaderAuth();
    }
    if (user) {
      navigate('/');
    }
  }, [config, user]);

  return (
    <AuthLogin
      title={t('pages.Login.authTitle')}
      error={error}
      callbackUrl="/"
      providers={config?.oauthProviders || []}
      onPasswordSignIn={config?.passwordAuth ? handlePasswordLogin : undefined}
      onOAuthSignIn={async (provider: string) => {
        window.location.href = apiClient.getOAuthEndpoint(provider);
      }}
      renderLogo={<Logo style={{ maxWidth: '60%', maxHeight: '90px' }} />}
    />
  );
}
