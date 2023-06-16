import { render, screen } from '@testing-library/react';
import React from 'react';

import { DataSourceHttpSettings } from '@grafana/ui';

import { HttpSettingsProps } from './types';

const jsonData = {
  timeInterval: '15s',
  httpMode: 'GET',
  keepCookies: ['cookie1', 'cookie2'],
};

const secureJsonData = {
  password: true,
};

const dataSourceConfig = {
  id: 4,
  uid: 'x',
  orgId: 1,
  name: 'gdev-influxdb',
  type: 'influxdb',
  typeName: 'Influxdb',
  typeLogoUrl: '',
  access: 'direct',
  url: 'http://localhost:8086',
  user: 'grafana',
  database: 'site',
  basicAuth: false,
  basicAuthUser: '',
  withCredentials: false,
  isDefault: false,
  jsonData,
  secureJsonData,
  secureJsonFields: {},
  readOnly: true,
};

const setup = (propOverrides?: object) => {
  const onChange = jest.fn();
  const props: HttpSettingsProps = {
    dataSourceConfig,
    onChange,
    ...propOverrides,
    defaultUrl: '',
  };

  render(<DataSourceHttpSettings {...props} />);
  return { onChange };
};

const SIGV4TestEditor = (props: { renderText: string }) => {
  return <>{props.renderText}</>;
};

describe('DataSourceHttpSettings', () => {
  it('should render SIGV4 label if SIGV4 is enabled', () => {
    setup({ sigV4AuthToggleEnabled: true });
    expect(screen.getByLabelText('SigV4 auth')).toBeInTheDocument();
  });

  it('should not render SIGV4 label if SIGV4 is not enabled', () => {
    setup({ sigV4AuthToggleEnabled: false });
    expect(screen.queryByText('SigV4 auth')).toBeNull();
  });

  it('should render SIGV4 editor if provided and SIGV4 is enabled', () => {
    const expectedText = 'sigv4-test-editor';
    setup({
      sigV4AuthToggleEnabled: true,
      renderSigV4Editor: <SIGV4TestEditor renderText={expectedText}></SIGV4TestEditor>,
      dataSourceConfig: {
        jsonData: {
          sigV4Auth: true,
        },
      },
    });
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  describe('allowed cookies', () => {
    it('should render TagsInput component if there is no allowed cookie option in the jsonData', () => {
      const expectedPlaceHolder = 'New tag (enter key to add)';
      const expectedCookie1 = 'cookie1';
      const expectedCookie2 = 'cookie2';
      setup({
        dataSourceConfig: {
          ...dataSourceConfig,
          access: 'proxy',
        },
      });
      expect(screen.getByPlaceholderText(expectedPlaceHolder)).toBeInTheDocument();
      expect(screen.getByText(expectedCookie1)).toBeInTheDocument();
      expect(screen.getByText(expectedCookie2)).toBeInTheDocument();
    });

    it('should render TagsInput component if allowedCookiePatternEnabled is false or undefined', () => {
      const expectedPlaceHolder = 'New tag (enter key to add)';
      const expectedCookie1 = 'cookie1';
      const expectedCookie2 = 'cookie2';
      setup({
        allowedCookiePatternEnabled: false,
        dataSourceConfig: {
          ...dataSourceConfig,
          access: 'proxy',
          jsonData: {
            ...jsonData,
          },
        },
      });
      expect(screen.getByPlaceholderText(expectedPlaceHolder)).toBeInTheDocument();
      expect(screen.getByText(expectedCookie1)).toBeInTheDocument();
      expect(screen.getByText(expectedCookie2)).toBeInTheDocument();
    });

    it('should render TagsInput component even if allowedCookiePatternEnabled is true without providing allowedCookieOption', () => {
      const expectedPlaceHolder = 'New tag (enter key to add)';
      const expectedCookie1 = 'cookie1';
      const expectedCookie2 = 'cookie2';
      setup({
        allowedCookiePatternEnabled: true,
        dataSourceConfig: {
          ...dataSourceConfig,
          access: 'proxy',
          jsonData: {
            ...jsonData,
          },
        },
      });
      expect(screen.getByPlaceholderText(expectedPlaceHolder)).toBeInTheDocument();
      expect(screen.getByText(expectedCookie1)).toBeInTheDocument();
      expect(screen.getByText(expectedCookie2)).toBeInTheDocument();
    });

    it('should render Regex pattern input component if allowedCookiePatternEnabled is true', () => {
      const expectedPlaceHolder = 'Regex pattern';
      setup({
        allowedCookiePatternEnabled: true,
        dataSourceConfig: {
          ...dataSourceConfig,
          access: 'proxy',
          jsonData: {
            ...jsonData,
            allowedCookieOption: 'regex_match',
          },
        },
      });
      expect(screen.getByPlaceholderText(expectedPlaceHolder)).toBeInTheDocument();
    });

    it('should render Regex pattern input component with value', () => {
      const expectedPlaceHolder = 'Regex pattern';
      const expectedPattern = '.*';
      setup({
        allowedCookiePatternEnabled: true,
        dataSourceConfig: {
          ...dataSourceConfig,
          access: 'proxy',
          jsonData: {
            ...jsonData,
            allowedCookieOption: 'regex_match',
            allowedCookiePattern: '.*',
          },
        },
      });
      expect(screen.getByPlaceholderText(expectedPlaceHolder)).toBeInTheDocument();
      expect(screen.getByDisplayValue(expectedPattern)).toBeInTheDocument();
    });
  });
});
